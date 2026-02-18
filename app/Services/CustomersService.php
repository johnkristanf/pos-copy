<?php

namespace App\Services;

use App\Data\Items\UploadAttachmentByIdData;
use App\Data\Menu\CreateCustomerData;
use App\Data\Menu\DeleteCustomerData;
use App\Data\Menu\UpdateCustomerData;
use App\Models\Customers;
use App\Models\Locations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CustomersService
{
    public function __construct(
        protected BlobAttachmentsService $blobAttachmentsService,
        protected NotificationService $notificationService
    ) {}

    public function getManyCustomers(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $search = trim($filters['search'] ?? '');

        $queryCallback = function (Builder $query) use ($filters) {
            $query->with([
                'locations:id,country,region,province,municipality,barangay',
                'credit',
            ])
                ->withCount('orders')
                ->withSum('orders as total_order_value', 'total_payable');

            $this->applyFilters($query, $filters);
            $query->latest('created_at');
        };

        if ($search) {
            if (config('scout.driver') === 'database') {
                $query = Customers::query();
                $queryCallback($query);

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_code', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });

                return $query->paginate($perPage)->withQueryString();
            }

            return Customers::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString();
        }

        $query = Customers::query();
        $queryCallback($query);

        return $query->paginate($perPage)->withQueryString();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query->when($filters['date_from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->when($filters['location_id'] ?? null, fn ($q, $id) => $q->where('location_id', $id));
    }

    public function createCustomer(CreateCustomerData $data): Customers
    {
        $customerExists = Customers::where('name', $data->name)->exists();

        if ($customerExists) {
            throw ValidationException::withMessages([
                'name' => 'A customer with this name already exists.',
            ]);
        }

        return DB::transaction(function () use ($data) {
            if ($data->credit_limit < 0) {
                throw new \InvalidArgumentException('Credit limit cannot be negative.');
            }

            $payload = $data->except(
                'customer_img',
                'blob_attachment_id',
                'location',
                'credit_limit',
                'credit_term',
                'credit_rating'
            )->toArray();

            $payload['location_id'] = $this->resolveLocationId($data->location);
            $payload['customer_code'] = $this->generateNextCustomerCode();
            $payload['affiliated'] = false;

            $customer = Customers::create($payload);

            $customer->credit()->create([
                'limit' => $data->credit_limit,
                'term' => $data->credit_term,
                'rating' => $data->credit_rating ?? null,
                'balance' => 0,
            ]);

            $this->processCustomerImage(
                $customer,
                $data->customer_img,
                $data->blob_attachment_id
            );

            $this->notificationService->notify('created new', ['customer_profile:read'], 'customer', $customer->name);

            return $customer;
        });
    }

    public function updateCustomer(Customers $customer, UpdateCustomerData $data): Customers
    {
        $customerExists = Customers::where('name', $data->name)->exists();

        if ($customerExists) {
            throw ValidationException::withMessages([
                'name' => 'A customer with this name already exists.',
            ]);
        }

        return DB::transaction(function () use ($customer, $data) {
            throw_if(
                request()->has('credit_limit') && $data->credit_limit < 0,
                fn () => new \InvalidArgumentException('Credit limit cannot be negative.')
            );

            $attributes = collect($data->except(
                'customer_img',
                'blob_attachment_id',
                'location',
                'credit_limit',
                'credit_term',
                'credit_rating'
            )->toArray())
                ->only(array_keys(request()->all()))
                ->when(request()->has('location'), fn ($c) => $c->put('location_id', $this->resolveLocationId($data->location)))
                ->toArray();

            if (! empty($attributes)) {
                $customer->update($attributes);
            }

            collect()
                ->when(request()->has('credit_limit'), fn ($c) => $c->put('limit', $data->credit_limit))
                ->when(request()->has('credit_term'), fn ($c) => $c->put('term', $data->credit_term))
                ->when(request()->has('credit_rating'), fn ($c) => $c->put('rating', $data->credit_rating))
                ->whenNotEmpty(function ($creditData) use ($customer) {
                    $customer->credit()->updateOrCreate(
                        ['customer_id' => $customer->id],
                        $creditData->toArray()
                    );
                });

            collect()
                ->when(request()->has('customer_img') || request()->has('blob_attachment_id'), function () use ($customer, $data) {
                    $this->processCustomerImage($customer, $data->customer_img, $data->blob_attachment_id);
                });

            $this->notificationService->notify('updated', ['customer_profile:read'], 'customer', $customer->name);

            return $customer->fresh(['locations', 'credit']);
        });
    }

    protected function processCustomerImage(Customers $customer, mixed $imageInput, ?int $blobId): void
    {
        if ($imageInput instanceof UploadedFile) {
            $data = new UploadAttachmentByIdData(
                file: $imageInput,
                item_id: 0,
                customer_id: $customer->id
            );
            $attachment = $this->blobAttachmentsService->uploadBlobAttachment($data, auth()->id());
            $customer->fill(['customer_img' => $attachment->file_url])->save();

            return;
        }

        if ($blobId) {
            $this->linkBlobToCustomer($customer, $blobId);

            return;
        }

        if (\is_string($imageInput)) {
            $customer->fill(['customer_img' => $imageInput])->save();
        }
    }

    protected function linkBlobToCustomer(Customers $customer, int $blobId): void
    {
        try {
            $attachment = $this->blobAttachmentsService->getBlobAttachmentById($blobId);
            $attachment->fill(['customer_id' => $customer->id])->save();
            $customer->fill(['customer_img' => $attachment->file_url])->save();
        } catch (\Exception $e) {
            Log::error("Failed to link blob {$blobId} to customer {$customer->id}: ".$e->getMessage());
        }
    }

    public function getCustomerById(int $id): ?Customers
    {
        return Customers::with([
            'locations',
            'credit',
        ])
            ->withCount('orders')
            ->withSum('orders as total_order_value', 'total_payable')
            ->find($id);
    }

    public function getRecentOrdersByCustomer(Customers $customer, int $limit = 10)
    {
        return $customer->orders()
            ->with([
                'order_items.item.sellingPrices:id,item_id,unit_price,wholesale_price,credit_price',
                'order_items.serve_locations:id,order_item_id,quantity_to_serve',
                'payment_method:id,name,tag',
                'credits.order_credit_payments',
            ])
            ->latest()
            ->limit($limit)
            ->get();
    }

    protected function resolveLocationId(?array $loc): ?int
    {
        if (empty($loc)) {
            return null;
        }

        return Locations::firstOrCreate([
            'country' => $loc['country'],
            'region' => $loc['region'] ?? null,
            'province' => $loc['province'] ?? null,
            'municipality' => $loc['municipality'] ?? null,
            'barangay' => $loc['barangay'] ?? null,
        ])->id;
    }

    protected function generateNextCustomerCode(): string
    {
        $nextId = (Customers::max('id') ?? 0) + 1;

        return 'CUST-'.str_pad((string) $nextId, 3, '0', STR_PAD_LEFT);
    }

    public function deleteCustomer(DeleteCustomerData $data): bool
    {
        return DB::transaction(function () use ($data) {
            $customer = Customers::findOrFail($data->id);
            $name = $customer->name;
            $deleted = $customer->delete($data->id);

            if ($deleted) {
                $this->notificationService->notify('deleted', ['customer_profile:read'], 'customer', $name);
            }

            return $deleted;
        });
    }

    public function increaseCustomerCreditBalance($amount, Customers $customer, bool $skipValidation = false)
    {
        $customer->loadMissing('credit');

        if ($amount > 0 && $customer->credit) {
            $currentBalancePlusPayable = $customer->credit->balance + $amount;

            if (! $skipValidation && ($currentBalancePlusPayable) > $customer->credit->limit) {
                throw ValidationException::withMessages(['error' => 'Credit limit exceeded for this customer.']);
            }

            $customer->credit->balance = $currentBalancePlusPayable;
            $customer->credit->save();
        }
    }
}
