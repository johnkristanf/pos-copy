<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\PriceReportService;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class PriceReportController extends Controller
{
    public function __construct(protected PriceReportService $priceReportService) {}

    public function renderPriceReportPage()
    {

        $startDate = $params['start_date'] ?? Carbon::now()->format('Y-m-d');
        $endDate = $params['end_date'] ?? Carbon::now()->addDays(30)->format('Y-m-d');

        $allItemsReport = $this->priceReportService->getAllItemsPriceReport($startDate, $endDate);

        return Inertia::render('reports/price-report', [
            'all_items_report' => $allItemsReport,
        ]);
    }

    public function getTotalRevenue()
    {
        $params = request()->only(['start_date', 'end_date']);

        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $totalRevenue = $this->priceReportService->getTotalRevenue($startDate, $endDate);

        return response()->json($totalRevenue);
    }

    public function getFastMovingItems()
    {
        $params = request()->only(['start_date', 'end_date']);

        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $fastMovingItems = $this->priceReportService->getMovingItems($startDate, $endDate, 'fast');

        return response()->json($fastMovingItems);

    }

    public function getSlowMovingItems()
    {
        $params = request()->only(['start_date', 'end_date']);

        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $slowMovingItems = $this->priceReportService->getMovingItems($startDate, $endDate, 'slow');

        return response()->json($slowMovingItems);
    }
}
