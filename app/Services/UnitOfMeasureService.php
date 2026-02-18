<?php

namespace App\Services;

use App\Data\Items\CreateUnitOfMeasureData;
use App\Data\Items\DeleteUnitOfMeasureData;
use App\Data\Items\GetManyUnitOfMeasuresData;
use App\Data\Items\UpdateUnitOfMeasureData;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UnitOfMeasureService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getManyUnitOfMeasures(GetManyUnitOfMeasuresData $data): LengthAwarePaginator
    {
        $search = trim($data->search ?? '');

        $queryCallback = function (Builder $query) use ($data) {
            $query->withCount(['baseConversionUnits']);

            $this->applyFilters($query, $data);
            $query->latest('created_at');
        };

        if ($search !== '') {
            return UnitOfMeasure::search($search)
                ->query($queryCallback)
                ->paginate($data->per_page)
                ->withQueryString();
        }

        $query = UnitOfMeasure::query();
        $queryCallback($query);

        return $query->paginate($data->per_page)->withQueryString();
    }

    protected function applyFilters(Builder $query, GetManyUnitOfMeasuresData $data): void
    {
        $query->when($data->date_from, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($data->date_to, fn ($q, $date) => $q->whereDate('created_at', '<=', $date));
    }

    public function getAllUnitOfMeasures(array $columns = ['id', 'name', 'code']): Collection
    {
        return UnitOfMeasure::query()
            ->select($columns)
            ->orderBy('name')
            ->get();
    }

    public function createUnit(CreateUnitOfMeasureData $data): UnitOfMeasure
    {
        return DB::transaction(function () use ($data) {
            $unit = UnitOfMeasure::create($data->toArray());
            $this->notificationService->notify('created new', ['inventory:read'], 'unit of measure', $unit->name);

            return $unit;
        });
    }

    public function updateUnit(UnitOfMeasure $unit, UpdateUnitOfMeasureData $data): bool
    {
        return DB::transaction(function () use ($unit, $data) {
            $updated = $unit->fill($data->toArray())->save();

            if ($updated) {
                $this->notificationService->notify('updated', ['inventory:read'], 'unit of measure', $unit->name);
            }

            return $updated;
        });
    }

    public function deleteUnit(DeleteUnitOfMeasureData $data): bool
    {
        return DB::transaction(function () use ($data) {
            $unit = UnitOfMeasure::findOrFail($data->id);
            $name = $unit->name;

            $deleted = (bool) $unit->delete($unit->id);

            if ($deleted) {
                $this->notificationService->notify('deleted', ['inventory:read'], 'unit of measure', $name);
            }

            return $deleted;
        });
    }
}
