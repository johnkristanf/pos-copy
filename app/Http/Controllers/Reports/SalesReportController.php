<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethods;
use App\Services\SalesService;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class SalesReportController extends Controller
{
    public function __construct(protected SalesService $salesService) {}

    public function renderSalesReportPage()
    {
        $params = request()->only(['start_date', 'end_date', 'payment_method_filter', 'category_filter', 'customer_filter']);

        $startDate = $params['start_date'] ?? Carbon::now()->format('Y-m-d');
        $endDate = $params['end_date'] ?? Carbon::now()->addDays(30)->format('Y-m-d');

        $paymentMethodFilter = $params['payment_method_filter'] ?? null;
        $categoryFilter = $params['category_filter'] ?? null;
        $customerFilter = $params['customer_filter'] ?? null;

        $itemCategorySales = $this->salesService->getItemCategorySales($startDate, $endDate, $paymentMethodFilter, $categoryFilter);
        $topCustomerSales = $this->salesService->getTopCustomerSales($startDate, $endDate, $paymentMethodFilter, $customerFilter);
        $cashReconcillation = $this->salesService->getCashReconciliation($startDate, $endDate);

        return Inertia::render('reports/sales-report', [
            'totalSales' => $this->salesService->getTotalSales($startDate, $endDate),
            'totalAffiliatedCustomer' => $this->salesService->getTopCustomerByVolume(true, $startDate, $endDate),
            'totalNonAffiliatedCustomer' => $this->salesService->getTopCustomerByVolume(false, $startDate, $endDate),

            'itemCategorySales' => $itemCategorySales,
            'topCustomerSales' => $topCustomerSales,
            'cashReconciliation' => $cashReconcillation,

            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'payment_method_filter' => $paymentMethodFilter,
                'category_filter' => $categoryFilter,
                'customer_filter' => $customerFilter,
            ],
        ]);
    }

    public function getTopAffiliatedVolume()
    {
        $params = request()->only(['start_date', 'end_date']);
        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $data = $this->salesService->getTopCustomerByVolume(true, $startDate, $endDate);

        return response()->json($data);
    }

    public function getTopNonAffiliatedVolume()
    {
        $params = request()->only(['start_date', 'end_date']);
        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $data = $this->salesService->getTopCustomerByVolume(false, $startDate, $endDate);

        return response()->json($data);
    }

    public function getItemCategorySales()
    {
        $params = request()->only(['start_date', 'end_date', 'payment_method_filter', 'filter_by', 'category_filter']);
        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $paymentMethodFilter = $params['payment_method_filter'] ?? PaymentMethods::CASH;
        $categoryFilter = $params['category_filter'] ?? $params['filter_by'] ?? null;

        $data = $this->salesService->getItemCategorySales($startDate, $endDate, $paymentMethodFilter, $categoryFilter);

        return response()->json($data);
    }

    public function getCustomerSales()
    {
        $params = request()->only(['start_date', 'end_date', 'payment_method_filter', 'filter_by', 'customer_filter']);
        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $paymentMethodFilter = $params['payment_method_filter'] ?? PaymentMethods::CASH;
        $customerFilter = $params['customer_filter'] ?? $params['filter_by'] ?? null;

        $data = $this->salesService->getTopCustomerSales($startDate, $endDate, $paymentMethodFilter, $customerFilter);

        return response()->json($data);
    }

    public function getTotalSales()
    {
        $params = request()->only(['start_date', 'end_date']);
        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $totalSales = $this->salesService->getTotalSales($startDate, $endDate);

        return response()->json($totalSales);
    }
}
