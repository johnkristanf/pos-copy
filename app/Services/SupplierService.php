<?php

namespace App\Services;

use App\Data\Suppliers\CreateSupplierData;
use App\Data\Suppliers\UpdateSupplierData;
use App\Models\Locations;
use App\Models\Suppliers;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SupplierService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getManySuppliers(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $search = trim($filters['search'] ?? '');

        $queryCallback = function (Builder $query) use ($filters) {
            $query->with(['location:id,country,region,province,municipality,barangay']);
            $this->applyFilters($query, $filters);
            $query->latest('created_at');
        };

        if ($search) {
            return Suppliers::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString();
        }

        $query = Suppliers::query();
        $queryCallback($query);

        return $query->paginate($perPage)->withQueryString();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query->when($filters['date_from'] ?? null, fn (Builder $q, $date) => $q->whereDate('created_at', '>=', $date));
        $query->when($filters['date_to'] ?? null, fn (Builder $q, $date) => $q->whereDate('created_at', '<=', $date));
    }

    public function getAllSuppliers(array $columns = ['*']): Collection
    {
        return Suppliers::query()->select($columns)->orderBy('name')->get();
    }

    public function createSupplier(CreateSupplierData $data): Suppliers
    {
        return DB::transaction(function () use ($data) {
            $location = Locations::findOrCreateLocation($data->location);
            $attributes = $data->except('location')->toArray();
            $attributes['location_id'] = $location->id;

            $supplier = Suppliers::create($attributes);

            $this->notificationService->notify('created new', ['return_to_supplier:read'], 'supplier', $supplier->name);

            return $supplier;
        });
    }

    public function updateSupplier(Suppliers $supplier, UpdateSupplierData $data): bool
    {
        return DB::transaction(function () use ($supplier, $data) {
            $location = Locations::findOrCreateLocation($data->location);

            $attributes = $data->except('location')->toArray();
            $attributes['location_id'] = $location->id;

            $updated = $supplier->fill($attributes)->save();

            if ($updated) {
                $this->notificationService->notify('updated', ['return_to_supplier:read'], 'supplier', $supplier->name);
            }

            return $updated;
        });
    }

    public function deleteSupplier(Suppliers $supplier): ?bool
    {
        return DB::transaction(function () use ($supplier) {
            $name = $supplier->name;

            $deleted = $supplier->delete($supplier->id);

            if ($deleted) {
                $this->notificationService->notify('deleted', ['return_to_supplier:read'], 'supplier', $name);
            }

            return $deleted;
        });
    }

    public function getSupplierByNameOrCreate(array $data)
    {
        return DB::transaction(fn () => Suppliers::firstOrCreate(
            ['name' => $data['name'] ?? null],
            [
                'address' => $data['address'] ?? null,
                'contact_no' => $data['contact_no'] ?? null,
                'contact_person' => $data['contact_person'] ?? null,
                'email' => $data['email'] ?? null,
                'shipping' => $data['shipping'] ?? null,
                'telefax' => $data['telefax'] ?? null,
                'terms' => $data['terms'] ?? null,
                'location_id' => $data['location_id'] ?? null,
            ]
        ));
    }

    public function fetchSupplierByDefiningFields(array $data)
    {
        return Suppliers::query()->where(['name' => $data['name'] ?? null])->first();
    }
}
