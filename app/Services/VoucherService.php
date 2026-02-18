<?php

namespace App\Services;

use App\Data\Operations\ApplyVoucherData;
use App\Data\Operations\CreateVoucherData;
use App\Data\Operations\DeleteVoucherData;
use App\Data\Operations\UpdateVoucherData;
use App\Models\Voucher;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VoucherService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getManyVouchers(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Voucher::query()->withCount('orders');

        $this->applyFilters($query, $filters);

        return $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $searchTerm = '%'.trim($search).'%';
            $q->where(function ($sub) use ($searchTerm) {
                $sub->where('code', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm);
            });
        });

        $query->when($filters['date_from'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '>=', $date);
        });

        $query->when($filters['date_to'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '<=', $date);
        });
    }

    public function createVoucher(CreateVoucherData $data): Voucher
    {
        return DB::transaction(function () use ($data) {
            $voucher = Voucher::create([
                'code' => $data->code,
                'description' => $data->description,
                'type' => $data->type,
                'amount' => $data->amount,
                'min_spend' => $data->min_spend,
                'capped_amount' => $data->capped_amount,
            ]);

            $this->notificationService->notify('created new', ['price_and_discount:read'], 'voucher', $voucher->code);

            return $voucher;
        });
    }

    public function updateVoucher(Voucher $voucher, UpdateVoucherData $data): Voucher
    {
        return DB::transaction(function () use ($voucher, $data) {
            $voucher->fill([
                'code' => $data->code,
                'description' => $data->description,
                'type' => $data->type,
                'amount' => $data->amount,
                'min_spend' => $data->min_spend,
                'capped_amount' => $data->capped_amount,
            ])->save();

            $this->notificationService->notify('updated', ['price_and_discount:read'], 'voucher', $voucher->code);

            return $voucher;
        });
    }

    public function deleteVoucher(DeleteVoucherData $data): void
    {
        DB::transaction(function () use ($data) {
            $voucher = Voucher::query()->findOrFail($data->id);
            $code = $voucher->code;

            $voucher->delete();

            $this->notificationService->notify('deleted', ['price_and_discount:read'], 'voucher', $code);
        });
    }

    public function applyVoucher(ApplyVoucherData $data): array
    {
        $voucher = Voucher::query()->where('code', $data->code)->first();

        if (! $voucher) {
            throw ValidationException::withMessages([
                'code' => 'Voucher not found or invalid.',
            ]);
        }

        if ($voucher->min_spend > 0 && $data->order_amount < $voucher->min_spend) {
            throw ValidationException::withMessages([
                'code' => "Minimum spend of {$voucher->min_spend} required.",
            ]);
        }

        $discountAmount = $this->calculateDiscount($voucher, $data->order_amount);
        $discountAmount = min($discountAmount, $data->order_amount);

        $this->notificationService->notify('applied', ['price_and_discount:read'], 'voucher', $voucher->code);

        return [
            'voucher' => $voucher,
            'discount_amount' => $discountAmount,
            'new_total' => max(0, $data->order_amount - $discountAmount),
        ];
    }

    private function calculateDiscount(Voucher $voucher, float $orderAmount): float
    {
        return match ($voucher->type) {
            'amount' => $voucher->amount,
            'percentage' => $this->calculatePercentageDiscount($voucher, $orderAmount),
            default => 0,
        };
    }

    private function calculatePercentageDiscount(Voucher $voucher, float $orderAmount): float
    {
        $discount = $orderAmount * ($voucher->amount / 100);

        return $voucher->capped_amount > 0 ? min($discount, $voucher->capped_amount) : $discount;
    }
}
