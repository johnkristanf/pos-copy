<?php

namespace App\Services;

use App\Data\Operations\CreateStockLocationData;
use App\Data\Operations\DeleteStockLocationData;
use App\Data\Operations\UpdateStockLocationData;
use App\Models\StockLocation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StockLocationService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getAllStockLocations(array $columns = ['*']): Collection
    {
        return StockLocation::query()->select($columns)->orderBy('name')->get();
    }

    public function getManyStockLocations(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = StockLocation::query()
            ->with('branch')
            ->withCount(['stock', 'assigned_users']);

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
                $sub->where('name', 'like', $searchTerm)
                    ->orWhere('tag', 'like', $searchTerm);
            });
        });

        $query->when($filters['date_from'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '>=', $date);
        });

        $query->when($filters['date_to'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '<=', $date);
        });
    }

    public function createStockLocation(CreateStockLocationData $data): StockLocation
    {
        return DB::transaction(function () use ($data) {
            $branchId = $data->branch_id ?? 1;
            $tag = $data->tag ?? Str::slug($data->name);

            $stockLocation = StockLocation::create([
                'name' => $data->name,
                'tag' => $tag,
                'branch_id' => $branchId,
            ]);

            $this->notificationService->notify('created new', ['inventory:read'], 'stock location', $stockLocation->name);

            return $stockLocation;
        });
    }

    public function updateStockLocation(StockLocation $stockLocation, UpdateStockLocationData $data): StockLocation
    {
        return DB::transaction(function () use ($stockLocation, $data) {
            $branchId = $data->branch_id ?? $stockLocation->branch_id;
            $tag = $data->tag ?? ($data->name !== $stockLocation->name ? Str::slug($data->name) : $stockLocation->tag);

            $stockLocation->fill([
                'name' => $data->name,
                'tag' => $tag,
                'branch_id' => $branchId,
            ]);
            $stockLocation->save();

            $this->notificationService->notify('updated', ['inventory:read'], 'stock location', $stockLocation->name);

            return $stockLocation;
        });
    }

    public function deleteStockLocation(DeleteStockLocationData $data): void
    {
        DB::transaction(function () use ($data) {
            $stockLocation = StockLocation::query()
                ->withCount(['stock', 'assigned_users'])
                ->findOrFail($data->id);

            if ($stockLocation->stock_count > 0) {
                throw ValidationException::withMessages(['error' => 'Cannot delete stock location. It has associated stock items.']);
            }

            if ($stockLocation->assigned_users_count > 0) {
                throw ValidationException::withMessages(['error' => 'Cannot delete stock location. It has assigned users.']);
            }

            $name = $stockLocation->name;
            $stockLocation->delete($data->id);

            $this->notificationService->notify('deleted', ['inventory:read'], 'stock location', $name);
        });
    }
}
