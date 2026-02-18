<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\CreateUnitOfMeasureData;
use App\Data\Items\DeleteUnitOfMeasureData;
use App\Data\Items\GetManyUnitOfMeasuresData;
use App\Data\Items\UpdateUnitOfMeasureData;
use App\Http\Controllers\Controller;
use App\Models\UnitOfMeasure;
use App\Services\UnitOfMeasureService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function __construct(
        protected UnitOfMeasureService $unitOfMeasureService,
    ) {}

    public function renderUnitOfMeasurePage(GetManyUnitOfMeasuresData $data)
    {
        return Inertia::render('items/unit-of-measure', [
            'unitOfMeasure' => $this->unitOfMeasureService->getManyUnitOfMeasures($data),
        ]);
    }

    public function createUnit(CreateUnitOfMeasureData $data): RedirectResponse
    {
        $this->unitOfMeasureService->createUnit($data);

        return back()->with('success', 'Unit created successfully.');
    }

    public function updateUnit(UpdateUnitOfMeasureData $data, UnitOfMeasure $unit): RedirectResponse
    {
        $this->unitOfMeasureService->updateUnit($unit, $data);

        return back()->with('success', 'Unit updated successfully.');
    }

    public function deleteUnit(DeleteUnitOfMeasureData $data): RedirectResponse
    {
        $this->unitOfMeasureService->deleteUnit($data);

        return back()->with('success', 'Unit deleted successfully.');
    }
}
