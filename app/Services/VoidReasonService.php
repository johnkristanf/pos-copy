<?php

namespace App\Services;

use App\Data\Operations\CreateVoidReasonData;
use App\Data\Operations\DeleteVoidReasonData;
use App\Data\Operations\UpdateVoidReasonData;
use App\Models\Roles;
use App\Models\VoidReason;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class VoidReasonService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getManyVoidReasons(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = VoidReason::query()
            ->with('roles_require_credentials.role');

        $this->applyFilters($query, $filters);

        return $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where('void_reason', 'like', '%'.trim($search).'%');
        });

        $query->when($filters['date_from'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '>=', $date);
        });

        $query->when($filters['date_to'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '<=', $date);
        });
    }

    public function getAllRoles(array $columns = ['id', 'code', 'name']): Collection
    {
        return Roles::query()
            ->select($columns)
            ->orderBy('name')
            ->get();
    }

    public function createVoidReason(CreateVoidReasonData $data): VoidReason
    {
        return DB::transaction(function () use ($data) {
            $voidReason = VoidReason::create([
                'void_reason' => $data->void_reason,
                'require_password' => $data->require_password,
            ]);

            $this->syncRoles($voidReason, $data->roles_require_credentials);
            $this->notificationService->notify('created new', ['price_and_discount:read'], 'void reason', $voidReason->void_reason);

            return $voidReason;
        });
    }

    public function updateVoidReason(VoidReason $voidReason, UpdateVoidReasonData $data): VoidReason
    {
        return DB::transaction(function () use ($voidReason, $data) {
            $voidReason->fill([
                'void_reason' => $data->void_reason,
                'require_password' => $data->require_password,
            ])->save();

            $this->syncRoles($voidReason, $data->roles_require_credentials);
            $this->notificationService->notify('updated', ['price_and_discount:read'], 'void reason', $voidReason->void_reason);

            return $voidReason;
        });
    }

    public function deleteVoidReason(DeleteVoidReasonData $data): void
    {
        $voidReason = VoidReason::findOrFail($data->id);
        $reason = $voidReason->void_reason;

        DB::transaction(function () use ($voidReason, $data, $reason) {
            $voidReason->roles_require_credentials()->delete();
            $voidReason->delete($data->id);
            $this->notificationService->notify('deleted', ['price_and_discount:read'], 'void reason', $reason);
        });
    }

    protected function syncRoles(VoidReason $voidReason, array $roleIds): void
    {
        $voidReason->roles_require_credentials()->delete();
        foreach ($roleIds as $roleId) {
            $voidReason->roles_require_credentials()->create([
                'role_id' => $roleId,
            ]);
        }
    }
}
