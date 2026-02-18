<?php

namespace App\Services;

use App\Data\Returns\ApprovedRFCFormData;
use App\Data\Returns\ApproveRTSFormData;
use App\Data\Returns\CreateRFCFormData;
use App\Data\Returns\CreateRTSFormData;
use App\Data\Returns\RejectRFCFormData;
use App\Data\Returns\RejectRTSFormData;
use App\Data\Returns\SetRFCFormToCheckedData;
use App\Data\Returns\SetRTSFormToCheckedData;
use App\Models\Features;
use App\Models\PurchasedItem;
use App\Models\ReturnFromCustomer;
use App\Models\ReturnsProcessRole;
use App\Models\ReturnsToSupplier;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReturnService
{
    public function __construct(
        protected StockService $stockService,
        protected NotificationService $notificationService
    ) {}

    public function getManyReturnsFromCustomer(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $status = ! empty($filters['status']) ? $filters['status'] : 'pending';
        $search = trim($filters['search'] ?? '');

        $loadRelations = [
            'customer',
            'items.sellingPrices:id,item_id,unit_price,wholesale_price,credit_price',
            'preparer:id,first_name,middle_name,last_name',
            'checker:id,first_name,middle_name,last_name',
            'approver:id,first_name,middle_name,last_name',
            'rejecter:id,first_name,middle_name,last_name',
        ];

        $user = User::with('roles')->find(Auth::id());
        $roleIds = $user->roles->pluck('id')->toArray();

        $feature = Features::query()->where('tag', config('features.return_from_customer.tag'))->first();

        $processRole = null;
        if ($feature) {
            $processRole = ReturnsProcessRole::query()
                ->whereIn('role_id', $roleIds)
                ->where('feature_id', $feature->id)
                ->first();
        }

        $queryCallback = function ($query) use ($loadRelations, $filters, $status, $processRole, $user) {
            $query->with($loadRelations);

            $this->applyRFCFilterByRole($query, $status, $processRole, $user->id);

            $this->applyOtherFilters($query, $filters);
        };

        if ($search) {
            return ReturnFromCustomer::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString();
        }

        $query = ReturnFromCustomer::query();
        $queryCallback($query);

        return $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function applyRFCFilterByRole($query, string $tabStatus, ?ReturnsProcessRole $processRole, int $userId): void
    {
        $roleType = $processRole?->type;

        if ($roleType === ReturnsProcessRole::CHECKER) {
            match ($tabStatus) {
                'pending' => $query->where('status', config('statuses.returns_from_customer.for_checking')),
                'approved' => $query->where('check_by', $userId),
                'rejected' => $query->where('rejected_by', $userId),
                default => null,
            };

            return;
        }

        if ($roleType === ReturnsProcessRole::APPROVER) {
            match ($tabStatus) {
                'pending' => $query->where('status', config('statuses.returns_from_customer.for_approval')),
                'approved' => $query->where('approved_by', $userId),
                'rejected' => $query->where('rejected_by', $userId),
                default => null,
            };

            return;
        }

        $query->where('prepared_by', $userId);

        match ($tabStatus) {
            'pending' => $query->whereIn('status', [
                config('statuses.returns_from_customer.for_checking'),
                config('statuses.returns_from_customer.for_approval'),
            ]),
            'approved' => $query->where('status', config('statuses.returns_from_customer.approved')),
            'rejected' => $query->where('status', config('statuses.returns_from_customer.rejected')),
            default => null,
        };
    }

    public function getManyReturnToSuppliers(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $status = ! empty($filters['status']) ? $filters['status'] : 'pending';
        $search = trim($filters['search'] ?? '');

        $loadRelations = [
            'supplier:id,name',
            'items.sellingPrices:id,item_id,unit_price,wholesale_price,credit_price',
            'prepared_by:id,first_name,middle_name,last_name',
            'checked_by:id,first_name,middle_name,last_name',
            'approved_by:id,first_name,middle_name,last_name',
            'rejected_by:id,first_name,middle_name,last_name',
        ];

        $user = User::with('roles')->find(Auth::id());
        $roleIds = $user->roles->pluck('id')->toArray();

        $feature = Features::query()->where('tag', config('features.return_to_supplier.tag'))->first();

        $processRole = null;
        if ($feature) {
            $processRole = ReturnsProcessRole::query()
                ->whereIn('role_id', $roleIds)
                ->where('feature_id', $feature->id)
                ->first();
        }

        $queryCallback = function ($query) use ($loadRelations, $filters, $status, $processRole, $user) {
            $query->with($loadRelations);

            $this->applyRTSFilterByRole($query, $status, $processRole, $user->id);

            $this->applyOtherFilters($query, $filters);
        };

        if ($search) {
            return ReturnsToSupplier::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString();
        }

        $query = ReturnsToSupplier::query();
        $queryCallback($query);

        return $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function applyRTSFilterByRole($query, string $tabStatus, ?ReturnsProcessRole $processRole, int $userId): void
    {
        $roleType = $processRole?->type;

        if ($roleType === ReturnsProcessRole::CHECKER) {
            match ($tabStatus) {
                'pending' => $query->where('status', config('statuses.returns_to_supplier.for_checking')),
                'approved' => $query->where('checked_by', $userId),
                'rejected' => $query->where('rejected_by', $userId),
                default => null,
            };

            return;
        }

        if ($roleType === ReturnsProcessRole::APPROVER) {
            match ($tabStatus) {
                'pending' => $query->where('status', config('statuses.returns_to_supplier.for_approval')),
                'approved' => $query->where('approved_by', $userId),
                'rejected' => $query->where('rejected_by', $userId),
                default => null,
            };

            return;
        }

        $query->where('prepared_by', $userId);

        match ($tabStatus) {
            'pending' => $query->whereIn('status', [
                config('statuses.returns_to_supplier.for_checking'),
                config('statuses.returns_to_supplier.for_approval'),
            ]),
            'approved' => $query->where('status', config('statuses.returns_to_supplier.approved')),
            'rejected' => $query->where('status', config('statuses.returns_to_supplier.rejected')),
            default => null,
        };
    }

    public function getItemsUnderSupplier(int $supplierID): array
    {
        $purchasedItems = PurchasedItem::query()->with([
            'item:id,sku,description,brand,color,size',
            'purchase_item_uom:purchased_item_id,code,name',
        ])
            ->select([
                'id',
                'purchased_quantity',
                'unit_price',
                'item_id',
            ])
            ->whereHas('item', function ($query) use ($supplierID) {
                $query->where('supplier_id', $supplierID);
            })
            ->where('status', '!=', PurchasedItem::STATUS_FULLY_STOCKED_IN)
            ->get();

        $stocks = Stock::query()->with([
            'location:id,tag,name',
            'items:id,sku,description,brand,color,size',
            'items.conversion_units:id,item_id,purchase_uom_id,base_uom_id,conversion_factor',
        ])
            ->select('id', 'available_quantity', 'committed_quantity', 'location_id', 'item_id')
            ->whereHas('items', function ($q) use ($supplierID) {
                $q->where('supplier_id', $supplierID);
            })
            ->get();

        $stocks = $stocks->map(function ($stock) {
            $conversionUnits = $stock->items?->conversion_units ?? null;

            $baseAvailableQty = isset($stock->available_quantity) ? (float) $stock->available_quantity : 0.0;
            $baseCommittedQty = isset($stock->committed_quantity) ? (float) $stock->committed_quantity : 0.0;

            $quantityInMainUom = $this->stockService->convertBaseQuantityToMainUom(
                $baseAvailableQty - $baseCommittedQty,
                $conversionUnits
            );

            return [
                'id' => $stock->id,
                'returnable_quantity' => $quantityInMainUom,
                'location_id' => $stock->location_id,
                'item_id' => $stock->item_id,
                'location' => $stock->location,
                'items' => $stock->items,
            ];
        })->values();

        $data = [
            'purchased_per_item' => $purchasedItems,
            'stocks_per_item' => $stocks,
        ];

        return $data;
    }

    public function createReturnFromCustomer(CreateRFCFormData $data): ReturnFromCustomer
    {
        return DB::transaction(function () use ($data) {
            $authenticatedUserID = Auth::id();

            $returnFromCustomer = ReturnFromCustomer::create([
                'invoice_number' => $data->invoice_number,
                'invoice_issued_date' => $data->invoice_issued_date,
                'reason' => $data->reason,
                'customer_id' => $data->customer_id,
                'prepared_by' => $authenticatedUserID,
                'status' => config('statuses.returns_from_customer.for_checking'),
            ]);

            foreach ($data->returned_items as $returnedItem) {
                $returnFromCustomer->items()->attach($returnedItem->item_id, [
                    'quantity' => $returnedItem->quantity,
                    'stock_location_id' => $returnedItem->stock_location_id,
                ]);
            }

            $this->notificationService->notify('created new', ['return_from_customer:read'], 'return from customer', "#{$returnFromCustomer->id}");

            return $returnFromCustomer;
        });
    }

    public function createReturnToSupplier(CreateRTSFormData $data): ReturnsToSupplier
    {
        return DB::transaction(function () use ($data) {
            $authenticatedUserID = Auth::id();

            $return = ReturnsToSupplier::create([
                'supplier_id' => $data->supplier_id,
                'type' => $data->type,
                'remarks' => $data->remarks,
                'prepared_by' => $authenticatedUserID,
                'status' => config('statuses.returns_to_supplier.for_checking'),
            ]);

            foreach ($data->items_to_return as $item) {
                $return->items()->attach($item->item_id, [
                    'quantity' => $item->quantity,
                    'deduction_source_type' => $item->deduction_source_type,
                    'deduction_source_id' => $item->deduction_source_id,
                ]);
            }

            $this->notificationService->notify('created new', ['return_to_supplier:read'], 'return to supplier', "#{$return->id}");

            return $return;
        });
    }

    public function setRFCFormToChecked(SetRFCFormToCheckedData $data): void
    {
        $returnFromCustomer = ReturnFromCustomer::findOrFail($data->id);

        $returnFromCustomer->check_by = Auth::id();
        $returnFromCustomer->status = config('statuses.returns_from_customer.for_approval');
        $returnFromCustomer->save();

        $this->notificationService->notify('marked as checked', ['return_from_customer:read'], 'return from customer', "#{$returnFromCustomer->id}");
    }

    public function approveRFCForm(ApprovedRFCFormData $data): void
    {
        DB::transaction(function () use ($data) {
            $returnFromCustomer = ReturnFromCustomer::with(['items.conversion_units'])
                ->lockForUpdate()
                ->findOrFail($data->id);

            $returnFromCustomer->setAttribute('approved_by', Auth::id());

            foreach ($returnFromCustomer->items as $item) {
                $stockLocationId = $item->pivot->stock_location_id;
                $quantity = $item->pivot->quantity;

                $stock = $this->stockService->fetchItemStockByStockLocationID($item->id, $stockLocationId);

                $baseQuantity = $this->stockService->convertItemQuantityUptoBase($quantity, $item->conversion_units);

                if (! $stock) {
                    $stock = Stock::create([
                        'item_id' => $item->id,
                        'location_id' => $stockLocationId,
                    ]);
                }

                $this->stockService->stockAdjustByAction(
                    Stock::INCREASE,
                    $stock,
                    $baseQuantity
                );
            }

            $returnFromCustomer->status = config('statuses.returns_from_customer.approved');
            $returnFromCustomer->save();

            $this->notificationService->notify('approved', ['return_from_customer:read'], 'return from customer', "#{$returnFromCustomer->id}");
        });
    }

    public function rejectRFCForm(RejectRFCFormData $data): void
    {
        $returnFromCustomer = ReturnFromCustomer::findOrFail($data->id);

        $returnFromCustomer->update([
            'status' => config('statuses.returns_from_customer.rejected'),
            'rejected_by' => Auth::id(),
        ]);

        $this->notificationService->notify('rejected', ['return_from_customer:read'], 'return from customer', "#{$returnFromCustomer->id}");
    }

    public function setRTSFormToChecked(SetRTSFormToCheckedData $data): void
    {
        $return = ReturnsToSupplier::findOrFail($data->id);

        $return->checked_by = Auth::id();
        $return->status = config('statuses.returns_to_supplier.for_approval');
        $return->save();

        $this->notificationService->notify('marked as checked', ['return_to_supplier:read'], 'return to supplier', "#{$return->id}");
    }

    public function approveRTSForm(ApproveRTSFormData $data): void
    {
        $authenticatedUserID = Auth::id();

        DB::transaction(function () use ($data, $authenticatedUserID) {
            $return = ReturnsToSupplier::with(['items.conversion_units'])
                ->findOrFail($data->id);

            foreach ($return->items as $item) {
                $itemId = $item->id;
                $conversionUnits = $item->conversion_units;

                /** @var \Illuminate\Database\Eloquent\Relations\Pivot $pivot */
                $pivot = $item->getRelation('pivot');

                $this->stockService->deductQuantityBasedOnSelectedSource($pivot->getAttribute('quantity'), $pivot->getAttribute('deduction_source_type'), $pivot->getAttribute('deduction_source_id'), $itemId, $conversionUnits);
            }

            $return->update([
                'status' => config('statuses.returns_to_supplier.approved'),
                'approved_by' => $authenticatedUserID,
            ]);

            $this->notificationService->notify('approved', ['return_to_supplier:read'], 'return to supplier', "#{$return->id}");
        });
    }

    public function rejectRTSForm(RejectRTSFormData $data): void
    {
        $return = ReturnsToSupplier::findOrFail($data->id);
        $authenticatedUserID = Auth::id();

        $return->update([
            'status' => config('statuses.returns_to_supplier.rejected'),
            'rejected_by' => $authenticatedUserID,
        ]);

        $this->notificationService->notify('cancelled', ['return_to_supplier:read'], 'return to supplier', "#{$return->id}");
    }

    public function applyOtherFilters($query, array $filters): void
    {
        $query
            ->when(! empty($filters['search_by']) && ! empty($filters['search']), fn ($q) => $q->where($filters['search_by'], 'like', '%'.$filters['search'].'%')
            )
            ->when(! empty($filters['category_id']), fn ($q) => $q->where('category_id', $filters['category_id'])
            )
            ->when(! empty($filters['location_id']), fn ($q) => $q->where('location_id', $filters['location_id'])
            )
            ->when(! empty($filters['sort_by']), fn ($q) => $q->orderBy($filters['sort_by'], $filters['sort_order'] ?? 'asc')
            );
    }
}
