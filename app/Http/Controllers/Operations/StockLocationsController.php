<?php

namespace App\Http\Controllers\Operations;

use App\Data\Operations\CreateStockLocationData;
use App\Data\Operations\DeleteStockLocationData;
use App\Data\Operations\UpdateStockLocationData;
use App\Http\Controllers\Controller;
use App\Models\StockLocation;
use App\Services\StockLocationService;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StockLocationsController extends Controller
{
    public function __construct(
        protected StockLocationService $stockLocationService,
    ) {}

    public function renderStockLocationPage()
    {
        $filters = [
            'search' => request()->get('search'),
            'date_from' => request()->get('date_from'),
            'date_to' => request()->get('date_to'),
        ];

        $perPage = request()->get('per_page', 10);

        $stockLocations = $this->stockLocationService->getManyStockLocations($filters, (int) $perPage);

        return Inertia::render('operations/stock-locations', [
            'stockLocations' => $stockLocations,
            'filters' => $filters,
        ]);
    }

    public function createStockLocation(CreateStockLocationData $data)
    {
        $this->stockLocationService->createStockLocation($data);

        return back()->with('success', 'Stock location created successfully.');
    }

    public function updateStockLocation(UpdateStockLocationData $data, StockLocation $stockLocation)
    {
        $this->stockLocationService->updateStockLocation($stockLocation, $data);

        return back()->with('success', 'Stock location updated successfully.');
    }

    public function deleteStockLocation(DeleteStockLocationData $data)
    {
        try {
            $this->stockLocationService->deleteStockLocation($data);
        } catch (ValidationException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Stock location deleted successfully.');
    }
}
