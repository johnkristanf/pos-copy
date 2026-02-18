<?php

namespace App\Services;

use App\Models\Customers;
use App\Models\ItemCategory;
use App\Models\OrderItem;
use App\Models\Orders;
use App\Models\PaymentMethods;
use App\Models\ReturnFromCustomer;
use Carbon\Carbon;

class SalesService
{
    public function __construct(protected OrdersService $ordersService) {}

    public function setFilterDefault($categoryFilter, $customerFilter, $paymentMethodFilter)
    {
        // 1. Determine the active main filter (Category or Customer)
        $activeFilter = $categoryFilter ?? $customerFilter;

        // 2. Default the main filter if null
        if (is_null($categoryFilter) || ! in_array($categoryFilter, ['cash_sales', 'credit_sales', 'sales_returns', 'net_sales'])) {
            $categoryFilter = 'cash_sales';
        }

        if (is_null($customerFilter) || ! in_array($customerFilter, ['cash_sales', 'credit_sales', 'sales_returns', 'net_sales'])) {
            $customerFilter = 'cash_sales';
        }

        // If payment method is null, look at the active filter to decide.
        if (is_null($paymentMethodFilter)) {
            if ($activeFilter === 'credit_sales') {
                $paymentMethodFilter = PaymentMethods::CREDIT;
            } elseif ($activeFilter === 'cash_sales') {
                $paymentMethodFilter = PaymentMethods::CASH;
            } else {
                // Fallback for net_sales or returns, usually defaults to cash
                $paymentMethodFilter = PaymentMethods::CASH;
            }
        }
        // Validate against allowed enums if it wasn't null
        elseif (! in_array($paymentMethodFilter, [PaymentMethods::CASH, PaymentMethods::CREDIT])) {
            $paymentMethodFilter = PaymentMethods::CASH;
        }

        return [
            'category_filter' => $categoryFilter,
            'customer_filter' => $customerFilter,
            'payment_method_filter' => $paymentMethodFilter,
        ];
    }

    // MAKE THIS FUNCTIONS READABLE LATER ON JK :>
    public function getTotalSales($startDate, $endDate)
    {
        $orders = Orders::with(['payments', 'credits'])
            ->when($startDate && $endDate, fn ($query) => $query->whereBetween('created_at', [$startDate, $endDate]))
            ->get();

        // Group orders by year and month number with the total sales (credit and cash) value
        $monthlyTotals = $orders->groupBy(fn ($order) => Carbon::parse($order->created_at)->format('Y-m'))->map(function ($monthlyOrders) { // Renamed from $orders to $monthlyOrders

            $firstOrder = $monthlyOrders->first();
            $carbonDate = Carbon::parse($firstOrder->created_at);
            $monthName = $carbonDate->format('F');
            $year = $carbonDate->format('Y');

            $total = 0;
            foreach ($monthlyOrders as $order) {
                $total += collect($order->payments)->sum('paid_amount');
                $total += collect($order->credits)->sum('amount');
            }

            return [
                'month' => $monthName,
                'year' => $year,
                'total' => $total,
            ];
        })->values(); // sort by month

        // Calculate grand total for all months
        $grandTotal = $monthlyTotals->sum('total');

        // Calculate average monthly sales
        $numberOfMonths = $monthlyTotals->count();
        $averageMonthlySales = $numberOfMonths > 0 ? $grandTotal / $numberOfMonths : 0;

        // Find the month with the highest sales value
        $highestMonth = $monthlyTotals->sortByDesc('total')->first();

        // Return loopable months, the overall total, average, and the month with the highest sales
        return [
            'months' => $monthlyTotals,
            'total' => $grandTotal,
            'average_monthly_sales' => (int) round($averageMonthlySales),
            'highest_month' => $highestMonth ? [
                'month' => $highestMonth['month'],
                'year' => $highestMonth['year'],
                'total' => $highestMonth['total'],
            ] : null,
        ];
    }

    public function getTopCustomerByVolume($isAffiliated, $startDate, $endDate, $top = 10)
    {
        $ordersQuery = Orders::with('customer')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->whereHas('customer', function ($query) use ($isAffiliated) {
                $query->where('affiliated', $isAffiliated);
            });

        $orders = $ordersQuery->get();

        // Group by customer name and sum total_payable, then limit to top 10
        $customerVolumes = $this->groupOrderByHighestCustomerVolume($orders, $top);

        return $customerVolumes;
    }

    public function groupOrderByHighestCustomerVolume($orders, $top)
    {
        return $orders->groupBy(fn ($order) => optional($order->customer)->name ?? 'Unknown')
            ->map(fn ($orders, $customerName) => [
                'customer_name' => $customerName,
                'total_volume' => $orders->sum('total_payable'),
            ])
            ->sortByDesc('total_volume')
            ->take($top)
            ->values();
    }

    public function getItemCategorySales($startDate, $endDate, $paymentMethodFilter, $categoryFilter, $top = 10)
    {
        $filters = $this->setFilterDefault($categoryFilter, null, $paymentMethodFilter);

        return ItemCategory::query()
            ->get()
            ->map(function ($category) use ($startDate, $endDate, $filters) {
                $ordersQuery = Orders::query()
                    ->with([
                        'payment_method:id,tag',
                        'order_items' => function ($query) use ($category) {
                            $query->whereHas('item', function ($itemQuery) use ($category) {
                                $itemQuery->where('category_id', $category->id);
                            })
                                ->with([
                                    'item.sellingPrices',
                                    'item.returned_from_customer_items',
                                    'serve_locations',
                                ]);
                        },
                    ])
                    ->withSum('payments', 'paid_amount')
                    ->withSum('credits', 'amount')
                    ->whereHas('order_items.item', function ($query) use ($category) {
                        $query->where('category_id', $category->id);
                    })
                    ->whereHas('payment_method', function ($q) use ($filters) {
                        $q->where('tag', $filters['payment_method_filter']);
                    })
                    ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                    });

                $orders = $ordersQuery->get()
                    ->map(function ($order) {
                        $totalReturnsSales = $this->ordersService->getTotalAmountReturnedPerOrder($order);
                        $order->sales_returns = $totalReturnsSales;

                        return $order;
                    });

                $totalAmount = $this->getTotalSalesAmountByFilter($filters['payment_method_filter'], $filters['category_filter'], $orders);

                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'total_amount' => $totalAmount,
                ];
            })
            ->sortByDesc('total_amount')
            ->take($top)
            ->values();
    }

    public function getTopCustomerSales($startDate, $endDate, $paymentMethodFilter, $customerFilter, $top = 10)
    {
        $filters = $this->setFilterDefault(null, $customerFilter, $paymentMethodFilter);

        return Customers::with([
            'orders' => function ($query) use ($filters, $startDate, $endDate) {
                $query->with([
                    'order_items.item.sellingPrices',
                    'order_items.item.returned_from_customer_items',
                ])
                    ->withSum('credits', 'amount')
                    ->withSum('payments', 'paid_amount')
                    ->whereHas('payment_method', function ($q) use ($filters) {
                        $q->where('tag', $filters['payment_method_filter']);
                    })
                    ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('created_at', [$startDate, $endDate]);
                    });
            },
        ])
            ->get()
            ->map(function ($customer) use ($filters) {

                $customer->orders->map(function ($order) {
                    $totalReturnsSales = $this->ordersService->getTotalAmountReturnedPerOrder($order);
                    $order->sales_returns = $totalReturnsSales;
                });

                $totalAmount = $this->getTotalSalesAmountByFilter($filters['payment_method_filter'], $filters['customer_filter'], $customer->orders);

                return [
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'total_amount' => $totalAmount,
                ];
            })
            ->sortByDesc('total_amount')
            ->take($top)
            ->values();
    }

    public function getTotalSalesAmountByFilter($paymentMethodFilter, $salesReportFilter, $orders)
    {
        // credit or cash filter already set at the order level, that is why both totalCashReturns and totalCreditReturns has the same sales_returns property
        $totalCashReturns = $orders->sum('sales_returns') ?? 0;
        $totalCreditReturns = $orders->sum('sales_returns') ?? 0;

        $totalAmount = 0;

        // CASH OR CREDIT SALES
        if ($paymentMethodFilter === PaymentMethods::CASH && $salesReportFilter === config('types.sales_report_filters.cash_sales')) {
            $totalCashSales = $orders->sum('payments_sum_paid_amount') ?? 0;
            $totalAmount = (float) $totalCashSales;
        } elseif ($paymentMethodFilter === PaymentMethods::CREDIT && $salesReportFilter === config('types.sales_report_filters.credit_sales')) {
            $totalCredits = $orders->sum('credits_sum_amount') ?? 0;
            $totalAmount = (float) $totalCredits;

            // SALES RETURN
        } elseif ($paymentMethodFilter === PaymentMethods::CASH && $salesReportFilter === config('types.sales_report_filters.sales_returns')) {
            $totalAmount = (float) $totalCashReturns;

        } elseif ($paymentMethodFilter === PaymentMethods::CREDIT && $salesReportFilter === config('types.sales_report_filters.sales_returns')) {
            $totalAmount = (float) $totalCreditReturns;

            // NET SALES
        } elseif ($paymentMethodFilter === PaymentMethods::CASH && $salesReportFilter === config('types.sales_report_filters.net_sales')) {
            $totalCashSales = $orders->sum('payments_sum_paid_amount') ?? 0;
            $netCashSales = $totalCashSales - $totalCashReturns;
            $totalAmount = $netCashSales;
        } elseif ($paymentMethodFilter === PaymentMethods::CREDIT && $salesReportFilter === config('types.sales_report_filters.net_sales')) {
            $totalCredits = $orders->sum('credits_sum_amount') ?? 0;
            $netCreditSales = $totalCredits - $totalCreditReturns;
            $totalAmount = (float) $netCreditSales;

            // AVOID RETUNING UNDEFINED
        } else {
            $totalAmount = 0;
        }

        return $totalAmount;
    }

    public function filterReturnedItemByCustomer(OrderItem $orderItem, Customers $customer)
    {
        return collect($orderItem->item->returned_from_customer_items)
            ->filter(function ($returnItem) use ($customer) {
                if (isset($returnItem['pivot']['return_id'])) {
                    $returnFromCustomer = ReturnFromCustomer::query()->find($returnItem['pivot']['return_id']);

                    return $returnFromCustomer && $returnFromCustomer->customer_id == $customer->id;
                }

                return false;
            })
            ->sum(function ($returnItem) {
                return $returnItem['pivot']['quantity'] ?? 0;
            });
    }

    public function getCashReconciliation($startDate, $endDate)
    {
        $cashSalesToBeRemitted = Orders::query()
            ->withSum('payments', 'paid_amount')
            ->whereHas('payment_method', fn ($q) => $q->where('tag', '!=', PaymentMethods::CREDIT))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->sum('payments_sum_paid_amount') ?? 0;

        $totalPaymentsAllOrders = Orders::query()
            ->whereHas('payments')
            ->withSum('payments', 'paid_amount')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->sum('payments_sum_paid_amount') ?? 0;

        $checkOnDate = Orders::query()
            ->withSum('payments', 'paid_amount')
            ->whereHas('payment_method', fn ($q) => $q->where('tag', PaymentMethods::CHECK))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->sum('payments_sum_paid_amount') ?? 0;

        $onlineBankTransfer = Orders::query()
            ->withSum('payments', 'paid_amount')
            ->whereHas('payment_method', fn ($q) => $q->where('tag', PaymentMethods::BANK_TRANSFER))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->sum('payments_sum_paid_amount') ?? 0;

        $cashRemitted = (float) $totalPaymentsAllOrders - (float) $checkOnDate - (float) $onlineBankTransfer;

        // Fetch the raw amount of the taxed orders using the Eloquent relation on the Orders model
        $withHoldingTax = Orders::query()
            ->whereHas('tax')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with('tax')
            ->get()
            ->flatMap(function ($order) {
                return $order->tax;
            })
            ->sum('amount');

        return [
            'cash_sales_to_be_remitted' => (float) $cashSalesToBeRemitted,
            'cash_remitted' => (float) $cashRemitted,
            'check_on_date' => (float) $checkOnDate,
            'online_bank_transfer' => (float) $onlineBankTransfer,
            'with_holding_tax' => (float) $withHoldingTax,
        ];
    }
}
