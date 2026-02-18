<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\ApiKeys;
use App\Models\Branch;
use App\Models\Customers;
use App\Models\Items;
use App\Models\ItemSellingPricesLog;
use App\Models\OrderCreditPayments;
use App\Models\OrderItem;
use App\Models\Orders;
use App\Models\Payments;
use App\Models\Roles;
use App\Models\Stock;
use App\Models\User;
use App\Models\Voucher;
use DB;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DashboardService
{
    public function __construct(
        protected ItemsService $itemsService,
        protected OrdersService $ordersService,
        protected PriceService $priceService
    ) {}

    public function getSalesOfficerDashboardData(User $user): array
    {
        $today = now()->startOfDay();

        $totalOrdersToday = Orders::query()->where('user_id', $user->id)
            ->where('created_at', '>=', $today)
            ->where('is_draft', false)
            ->count();

        $totalSalesToday = Orders::query()->where('user_id', $user->id)
            ->where('created_at', '>=', $today)
            ->where('payment_status', 'fully_paid')
            ->sum('total_payable');

        $pendingQuotations = Orders::query()->where('user_id', $user->id)
            ->where('is_draft', true)
            ->count();

        $recentOrders = Orders::with(['customer', 'payment_method'])
            ->where('user_id', $user->id)
            ->where('is_draft', false)
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer ? $order->customer->name : 'Walk-in Customer',
                'amount' => $order->total_payable,
                'status' => $order->status,
                'time_ago' => $order->created_at->diffForHumans(),
                'payment_method' => $order->payment_method?->name ?? 'N/A',
            ]);

        return [
            'stats' => [
                'total_orders' => $totalOrdersToday,
                'total_sales' => $totalSalesToday,
                'pending_quotations' => $pendingQuotations,
            ],
            'recent_orders' => $recentOrders,
        ];
    }

    public function lookupItems(string $query): EloquentCollection|Collection
    {
        $paginator = $this->itemsService->getManyItems(['search' => $query], 5);

        $items = EloquentCollection::make($paginator->items());

        if ($items->isNotEmpty()) {
            $relationsToLoad = [
                'category',
                'supplier',
                'sellingPrices',
                'discounts',
                'stocks.location',
            ];
            $items->load($relationsToLoad);
        }

        return $items->map(function ($item) {
            $storeStock = $item->stocks->filter(function ($stock) {
                $name = strtolower($stock->location->name ?? '');

                return Str::contains($name, ['store', 'shop', 'branch', 'front', 'display']);
            })->sum('available_quantity');

            $warehouseStock = $item->stocks->filter(function ($stock) {
                $name = strtolower($stock->location->name ?? '');

                return Str::contains($name, ['warehouse', 'bodega', 'back', 'storage']);
            })->sum('available_quantity');

            if ($storeStock == 0 && $warehouseStock == 0) {
                $warehouseStock = $item->stocks->sum('available_quantity');
            }

            $priceValue = $item->sellingPrices ? $item->sellingPrices->unit_price : 0;

            $conversionUnits = $item->relationLoaded('conversionUnits') ? $item->conversionUnits :
            ($item->relationLoaded('conversion_units') ? $item->conversion_units : []);

            $componentBlueprint = $item->relationLoaded('componentBlueprint') ? $item->componentBlueprint :
            ($item->relationLoaded('component_blueprint') ? $item->component_blueprint : []);

            return [
                'id' => $item->id,
                'image_url' => $item->image_url,
                'sku' => $item->sku,
                'description' => $item->description,
                'brand' => $item->brand,
                'color' => $item->color,
                'size' => $item->size,
                'min_quantity' => (float) $item->min_quantity,
                'max_quantity' => (float) $item->max_quantity,
                'category_id' => $item->category_id,
                'supplier_id' => $item->supplier_id,
                'is_active' => (bool) $item->is_active,
                'item_unit_type' => ! empty($componentBlueprint) ? Items::SET_UNIT_TYPE : Items::NOT_SET_UNIT_TYPE,
                'total_available_stock' => (float) ($item->total_available_stock ?? $item->stocks->sum('available_quantity')),
                'total_committed_stock' => (float) ($item->total_committed_stock ?? $item->stocks->sum('committed_quantity')),
                'conversion_units' => $conversionUnits,
                'components_blueprint' => $componentBlueprint,
                'selling_prices' => $item->sellingPrices,
                'category' => $item->category,
                'supplier' => $item->supplier,
                'discounts' => $item->discounts,
                'stocks' => $item->stocks->map(fn ($stock) => [
                    'available_quantity' => (float) $stock->available_quantity,
                    'location' => $stock->location,
                ]),
                'locations' => $item->stocks->map(fn ($s) => $s->location?->name)->filter()->unique()->values(),
                'name' => $item->description,
                'price' => (float) $priceValue,
                'store_stock' => (int) $storeStock,
                'warehouse_stock' => (int) $warehouseStock,
            ];
        });
    }

    public function getCashierDashboardData(User $user): array
    {
        $today = now()->startOfDay();

        $dailyCollections = Payments::query()
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->join('payment_methods', 'orders.payment_method_id', '=', 'payment_methods.id')
            ->where('payments.created_at', '>=', $today)
            ->select(
                'payment_methods.name as method',
                'payment_methods.tag',
                DB::raw('SUM(payments.paid_amount) as total')
            )
            ->groupBy('payment_methods.name', 'payment_methods.tag')
            ->get();

        $creditPaymentsTotal = OrderCreditPayments::where('created_at', '>=', $today)
            ->sum('amount');

        if ($creditPaymentsTotal > 0) {
            $dailyCollections->push((object) [
                'method' => 'Credit Payment',
                'tag' => 'credit_payment',
                'total' => (float) $creditPaymentsTotal,
            ]);
        }

        $paginator = $this->ordersService->getOrdersByUserStatus(
            Orders::ACTIVE,
            $user->id,
            [],
            20
        );

        $pendingOrders = EloquentCollection::make($paginator->items());

        if ($pendingOrders->isNotEmpty()) {
            $pendingOrders->load(['customer.credit', 'payments']);
        }

        $pendingTransactions = $pendingOrders->map(fn ($order) => [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer ? $order->customer->name : 'Walk-in Customer',
            'customer_rating' => $order->customer?->credit?->rating ?? 0,
            'total_payable' => (float) $order->total_payable,
            'amount_paid' => (float) $order->payments->sum('paid_amount'),
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method?->name ?? 'N/A',
            'time_ago' => $order->created_at->diffForHumans(),
        ]);

        return [
            'daily_collections' => $dailyCollections,
            'pending_transactions' => $pendingTransactions,
            'total_collected_today' => $dailyCollections->sum('total'),
            'queue_count' => $paginator->total(),
        ];
    }

    public function getSupervisorDashboardData(int $year): array
    {
        $startOfYear = Carbon::createFromDate($year)->startOfYear();
        $endOfYear = Carbon::createFromDate($year)->endOfYear();

        return [
            'supervisor_charts' => [
                'monthly_sales' => $this->getMonthlySalesData($startOfYear, $endOfYear),
                'category_distribution' => $this->getCategoryRevenueData($startOfYear, $endOfYear),
                'sales_percentage' => $this->getTopSellingItems($startOfYear, $endOfYear, 10),
                'customer_segmentation' => $this->getCustomerSegmentationData($startOfYear, $endOfYear),
                'monthly_sales_summary' => $this->getMonthlySalesBreakdown($startOfYear, $endOfYear),
            ],
            'selected_year' => (string) $year,
            'available_years' => $this->getAvailableYears(),
        ];
    }

    private function getLowStockAlerts(): Collection
    {
        return Items::with(['stocks.location'])
            ->where('is_active', true)
            ->get()
            ->filter(function ($item) {
                $totalAvailable = $item->stocks->sum('available_quantity');

                return $totalAvailable <= $item->min_quantity;
            })
            ->sortBy(fn ($item) => $item->stocks->sum('available_quantity'))
            ->take(20)
            ->map(function ($item) {
                $totalAvailable = $item->stocks->sum('available_quantity');

                return [
                    'id' => $item->id,
                    'sku' => $item->sku,
                    'name' => $item->description,
                    'location' => $item->stocks->map(fn ($s) => $s->location?->name)->filter()->unique()->implode(', ') ?: 'N/A',
                    'current_level' => (float) $totalAvailable,
                    'reorder_point' => (float) $item->min_quantity,
                    'status' => $totalAvailable <= $item->min_quantity * 0.5 ? 'Critical' : 'Low',
                ];
            })
            ->values();
    }

    private function getItemMovementHistory(): Collection
    {
        return ActivityLog::with('causer')
            ->whereIn('log_name', ['stock', 'stock_in', 'items'])
            ->latest()
            ->limit(15)
            ->get()
            ->map(function (ActivityLog $log) {
                $causer = $log->causer;
                $causerName = $causer ? ($causer->getAttribute('name') ?? $causer->getAttribute('first_name') ?? $causer->getAttribute('email')) : 'System';

                return [
                    'id' => $log->id,
                    'event' => str_replace('_', ' ', strtoupper($log->event ?? '')),
                    'description' => $log->description,
                    'causer' => $causerName,
                    'properties' => $log->properties,
                    'time_ago' => $log->created_at?->diffForHumans() ?? '',
                ];
            });
    }

    private function getInventoryKPIs(): array
    {
        $stockStats = Stock::query()
            ->join('items', 'stocks.item_id', '=', 'items.id')
            ->leftJoin('item_selling_prices', 'items.id', '=', 'item_selling_prices.item_id')
            ->selectRaw('
                SUM(stocks.available_quantity) as total_qty,
                SUM(stocks.available_quantity * COALESCE(item_selling_prices.unit_price, 0)) as total_value
            ')
            ->first();

        return [
            'total_items' => Items::query()->where('is_active', true)->count(),
            'total_stock_on_hand' => (float) $stockStats->total_qty,
            'inventory_value' => (float) $stockStats->total_value,
            'out_of_stock_count' => Items::whereDoesntHave('stocks', fn ($q) => $q->where('available_quantity', '>', 0))->count(),
        ];
    }

    private function getCategoryStockDistribution(): Collection
    {
        return DB::table('item_categories')
            ->join('items', 'item_categories.id', '=', 'items.category_id')
            ->join('stocks', 'items.id', '=', 'stocks.item_id')
            ->select(
                'item_categories.name',
                DB::raw('SUM(stocks.available_quantity) as total'),
                DB::raw('(SELECT uom.name
                        FROM items as i
                        JOIN item_conversion_units as icu ON i.id = icu.item_id
                        JOIN unit_of_measures as uom ON icu.base_uom_id = uom.id
                        WHERE i.category_id = item_categories.id
                        ORDER BY i.created_at DESC
                        LIMIT 1) as unit')
            )
            ->groupBy('item_categories.id', 'item_categories.name')
            ->get();
    }

    public function getInventoryManagerDashboardData(User $user, int $year): array
    {
        $availableYears = $this->getAvailableYears();
        $startOfYear = Carbon::createFromDate($year)->startOfYear();
        $endOfYear = Carbon::createFromDate($year)->endOfYear();

        $salesData = DB::table('orders')
            ->where('payment_status', 'fully_paid')
            ->whereBetween('created_at', [$startOfYear, $endOfYear])
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_payable) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthlySales = collect();
        $currentMonth = $startOfYear->copy();

        while ($currentMonth <= $endOfYear) {
            $monthKey = $currentMonth->format('Y-m');
            $monthlySales->push([
                'month' => $currentMonth->format('M'),
                'total' => (float) ($salesData->get($monthKey)?->total ?? 0),
            ]);
            $currentMonth->addMonth();
        }

        $categoryStats = DB::table('order_items')
            ->join('items', 'order_items.item_id', '=', 'items.id')
            ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            ->join('order_item_serve_locations', 'order_items.id', '=', 'order_item_serve_locations.order_item_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'fully_paid')
            ->whereBetween('orders.created_at', [$startOfYear, $endOfYear])
            ->select('item_categories.name', DB::raw('SUM(order_item_serve_locations.quantity_to_serve) as total'))
            ->groupBy('item_categories.id', 'item_categories.name')
            ->get();

        $topItems = DB::table('order_items')
            ->join('items', 'order_items.item_id', '=', 'items.id')
            ->join('order_item_serve_locations', 'order_items.id', '=', 'order_item_serve_locations.order_item_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'fully_paid')
            ->whereBetween('orders.created_at', [$startOfYear, $endOfYear])
            ->select('items.description', DB::raw('SUM(order_item_serve_locations.quantity_to_serve) as total'))
            ->groupBy('items.id', 'items.description')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $customerStats = DB::table('orders')
            ->leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
            ->where('payment_status', 'fully_paid')
            ->whereBetween('orders.created_at', [$startOfYear, $endOfYear])
            ->selectRaw("COALESCE(customers.name, 'Walk-in') as name, SUM(orders.total_payable) as total")
            ->groupBy('name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($record) => [
                'name' => $record->name,
                'total' => (float) $record->total,
            ]);

        return [
            'kpis' => $this->getInventoryKPIs(),
            'low_stock_alerts' => $this->getLowStockAlerts(),
            'recent_movements' => $this->getItemMovementHistory(),
            'stock_distribution' => $this->getCategoryStockDistribution(),
            'monthly_sales' => $monthlySales->toArray(),
            'category_percentage' => $categoryStats,
            'sales_percentage' => $topItems,
            'customer_percentage' => $customerStats,
            'selected_year' => (string) $year,
            'available_years' => $availableYears,
        ];
    }

    public function getInventoryOfficerDashboardData(User $user): array
    {
        $paginator = $this->ordersService->getOrdersByUserStatus(
            Orders::ACTIVE,
            $user->id,
            ['per_page' => 10]
        );

        $transactionQueue = EloquentCollection::make($paginator->items());
        $formattedQueue = $this->getFormattedTransactionQueue($transactionQueue);
        $lowStockAlerts = $this->getLowStockAlertsForUser($user);
        $totalPendingItems = $transactionQueue->sum(fn ($o) => $o->order_items->sum('quantity'));

        return [
            'stats' => [
                'pending_orders_count' => $paginator->total(),
                'items_to_release_count' => $totalPendingItems,
                'low_stock_count' => $lowStockAlerts->count(),
            ],
            'transaction_queue' => $formattedQueue,
            'low_stock_alerts' => $lowStockAlerts,
            'recent_activity' => $this->getInventoryOfficerActivity($user),
        ];
    }

    private function getFormattedTransactionQueue(EloquentCollection $transactionQueue): Collection
    {
        return $transactionQueue->map(fn (Orders $order) => [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer ? $order->customer->name : 'Walk-in',
            'items_count' => $order->order_items->sum('quantity'),
            'status' => 'Ready for Release',
            'time_ago' => $order->created_at->diffForHumans(),
            'priority' => $order->created_at->isToday() ? 'High' : 'Normal',
            'items' => $order->order_items->map(fn (OrderItem $item) => [
                'item_name' => $item->item?->description,
                'sku' => $item->item?->sku,
                'quantity_to_release' => (float) $item->quantity,
                'bin_location' => $item->serve_locations?->stock_location?->name ?? 'N/A',
            ]),
        ]);
    }

    private function getLowStockAlertsForUser(User $user): Collection
    {
        $userLocationIds = $user->assigned_stock_locations->pluck('id');

        if ($userLocationIds->isEmpty()) {
            return collect();
        }

        return Items::with(['stocks' => function ($query) use ($userLocationIds) {
            $query->whereIn('location_id', $userLocationIds)->with('location');
        }])
            ->where('is_active', true)
            ->get()
            ->filter(function ($item) {
                $totalAvailable = $item->stocks->sum('available_quantity');

                return $totalAvailable <= (float) $item->min_quantity;
            })
            ->sortBy(fn ($item) => $item->stocks->sum('available_quantity'))
            ->take(10)
            ->map(function ($item) {
                $totalAvailable = $item->stocks->sum('available_quantity');
                $locations = $item->stocks->map(fn ($s) => $s->location?->name)->filter()->unique()->implode(', ') ?: 'N/A';

                return [
                    'id' => $item->id,
                    'sku' => $item->sku,
                    'name' => $item->description,
                    'location' => $locations,
                    'current_level' => (float) $totalAvailable,
                    'reorder_point' => (float) $item->min_quantity,
                    'severity' => $totalAvailable <= ($item->min_quantity * 0.5) ? 'critical' : 'warning',
                ];
            })
            ->values();
    }

    private function getInventoryOfficerActivity(User $user): Collection
    {
        return ActivityLog::query()
            ->where('causer_id', $user->id)
            ->whereIn('log_name', ['orders', 'stock', 'transfer'])
            ->latest()
            ->take(8)
            ->get()
            ->map(fn ($log) => [
                'description' => $log->description,
                'time' => $log->created_at->format('H:i'),
                'date' => $log->created_at->isToday() ? 'Today' : $log->created_at->format('M d'),
                'type' => $log->event === 'updated' ? 'action' : 'info',
            ]);
    }

    public function getMerchandiserDashboardData(int $year): array
    {
        $actionItems = $this->getMerchandiserActionItems();
        $kpis = $this->getMerchandiserKPIs();
        $priceLogs = $this->getMerchandiserPriceLogs();
        $charts = $this->getMerchandiserCharts($year);
        $availableYears = $this->getAvailableYears();
        $categoryDistribution = $this->getCategoryStockDistribution();

        return [
            'action_items' => $actionItems,
            'kpis' => $kpis,
            'recent_price_changes' => $priceLogs,
            'category_distribution' => $categoryDistribution,
            'charts' => $charts,
            'selected_year' => (string) $year,
            'available_years' => $availableYears,
        ];
    }

    private function getMerchandiserActionItems(): array
    {

        $paginator = $this->priceService->getPaginatedPrices([], 100);

        $unpricedItems = collect($paginator->items())
            ->filter(function ($item) {
                $prices = $item['selling_prices'];

                if ($prices === null) {
                    return true;
                }

                return ($prices['unit_price'] ?? 0) <= 0 ||
                    ($prices['wholesale_price'] ?? 0) <= 0 ||
                    ($prices['credit_price'] ?? 0) <= 0;
            })
            ->take(10)
            ->map(fn ($item) => [
                'id' => $item['id'],
                'sku' => $item['sku'],
                'name' => $item['description'],
                'stock_count' => (float) ($item['available_stocks'] ?? 0),
            ])
            ->values();

        $thirtyDaysAgo = now()->subDays(30);
        $slowMoving = Items::whereHas('stocks', fn ($q) => $q->where('available_quantity', '>', 10))
            ->whereDoesntHave('order_items', fn ($q) => $q->where('created_at', '>=', $thirtyDaysAgo)
            )
            ->take(5)
            ->get()
            ->map(fn ($item) => [
                'name' => $item->description,
                'reason' => 'High stock, no recent sales',
            ]);

        return [
            'unpriced_items' => $unpricedItems,
            'slow_moving_stock' => $slowMoving,
        ];
    }

    private function getMerchandiserKPIs(): array
    {
        $activeVouchersCount = Voucher::query()->whereNull('deleted_at')->count();
        $totalOrdersWithVouchers = Orders::query()->whereNotNull('used_voucher')->count();

        return [
            'active_vouchers' => $activeVouchersCount,
            'vouchers_redeemed_total' => $totalOrdersWithVouchers,
        ];
    }

    private function getMerchandiserPriceLogs(): Collection
    {
        return ItemSellingPricesLog::query()
            ->select([
                'item_selling_prices_logs.id',
                'item_selling_prices_logs.item_id',
                'item_selling_prices_logs.unit_price as new_price',
                'item_selling_prices_logs.created_at',
                DB::raw('(SELECT unit_price FROM item_selling_prices_logs as prev WHERE prev.item_id = item_selling_prices_logs.item_id AND prev.id < item_selling_prices_logs.id ORDER BY prev.id DESC LIMIT 1) as old_price'),
            ])
            ->with('item')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($log) => [
                'item' => $log->item->description ?? 'Unknown Item',
                'sku' => $log->item->sku ?? '-',
                'old_price' => (float) ($log->old_price ?? 0),
                'new_price' => (float) $log->new_price,
                'changed_at' => $log->created_at->diffForHumans(),
            ]);
    }

    private function getMerchandiserCharts(int $year): array
    {
        $startOfYear = Carbon::createFromDate($year)->startOfYear();
        $endOfYear = Carbon::createFromDate($year)->endOfYear();

        $salesData = DB::table('orders')
            ->where('payment_status', 'fully_paid')
            ->whereBetween('created_at', [$startOfYear, $endOfYear])
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_payable) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthlySales = collect();
        $currentMonth = $startOfYear->copy();

        while ($currentMonth <= $endOfYear) {
            $monthKey = $currentMonth->format('Y-m');
            $monthlySales->push([
                'month' => $currentMonth->format('M'),
                'total' => (float) ($salesData->get($monthKey)?->total ?? 0),
            ]);
            $currentMonth->addMonth();
        }

        $categoryStats = DB::table('order_items')
            ->join('items', 'order_items.item_id', '=', 'items.id')
            ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('order_item_serve_locations', 'order_items.id', '=', 'order_item_serve_locations.order_item_id')
            ->leftJoin('item_selling_prices', 'items.id', '=', 'item_selling_prices.item_id')
            ->where('orders.payment_status', 'fully_paid')
            ->whereBetween('orders.created_at', [$startOfYear, $endOfYear])
            ->select('item_categories.name', DB::raw('SUM(order_item_serve_locations.quantity_to_serve * COALESCE(item_selling_prices.unit_price, 0)) as total_revenue'))
            ->groupBy('item_categories.id', 'item_categories.name')
            ->get();

        $customerStats = DB::table('orders')
            ->leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
            ->where('payment_status', 'fully_paid')
            ->whereBetween('orders.created_at', [$startOfYear, $endOfYear])
            ->selectRaw("COALESCE(customers.name, 'Walk-in') as name, SUM(orders.total_payable) as total")
            ->groupBy('name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return [
            'monthly_sales' => $monthlySales,
            'category_sales' => $categoryStats,
            'customer_sales' => $customerStats,
        ];
    }

    private function getAvailableYears(): array
    {
        $availableYears = Orders::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($y) => (string) $y)
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [(string) now()->year];
        }

        return $availableYears;
    }

    public function getAdministratorDashboardData(): array
    {
        return [
            'admin_kpis' => $this->getAdminKPIs(),
            'admin_charts' => [
                'role_distribution' => $this->getRoleDistribution(),
            ],
            'admin_activity_feed' => $this->getAdminActivityFeed(),
        ];
    }

    private function getAdminKPIs(): array
    {
        $activeApiKeys = ApiKeys::query()->where('isactive', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->count();

        $expiringSoonKeys = ApiKeys::query()->where('isactive', true)
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(30))
            ->count();

        return [
            'total_users' => User::query()->count(),
            'inactive_users' => User::onlyTrashed()->count(),
            'active_integrations' => $activeApiKeys,
            'keys_expiring_soon' => $expiringSoonKeys,
            'total_branches' => Branch::query()->count(),
        ];
    }

    private function getRoleDistribution(): Collection
    {
        return Roles::withCount('users')
            ->get()
            ->map(fn (Roles $role) => [
                'name' => $role->name,
                'count' => $role->users_count,
            ])
            ->sortByDesc('count')
            ->values();
    }

    private function getAdminActivityFeed(): Collection
    {
        return ActivityLog::with('causer')
            ->latest()
            ->take(15)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'description' => $log->description,
                'causer' => $log->causer?->name ?? 'System/Unknown',
                'module' => Str::upper($log->log_name ?? 'SYSTEM'),
                'event' => $log->event,
                'created_at' => $log->created_at->toDateTimeString(),
                'time_ago' => $log->created_at->diffForHumans(),
                'severity' => \in_array($log->log_name, ['authentication', 'security']) ? 'high' : 'normal',
            ]);
    }

    public function getPurchasingSalesHeadDashboardData(int $year): array
    {
        $startOfYear = Carbon::createFromDate($year)->startOfYear();
        $endOfYear = Carbon::createFromDate($year)->endOfYear();
        $previousYearStart = $startOfYear->copy()->subYear();
        $previousYearEnd = $endOfYear->copy()->subYear();

        $currentYearRevenue = Orders::query()
            ->where('payment_status', 'fully_paid')
            ->whereBetween('created_at', [$startOfYear, $endOfYear])
            ->sum('total_payable');

        $previousYearRevenue = Orders::query()
            ->where('payment_status', 'fully_paid')
            ->whereBetween('created_at', [$previousYearStart, $previousYearEnd])
            ->sum('total_payable');

        $revenueGrowth = $previousYearRevenue > 0
        ? (($currentYearRevenue - $previousYearRevenue) / $previousYearRevenue) * 100
        : 0;

        $totalActiveCustomers = Customers::query()->count();
        $monthlySales = $this->getMonthlySalesData($startOfYear, $endOfYear);
        $categoryPerformance = $this->getCategoryRevenueData($startOfYear, $endOfYear);
        $customerSegmentation = $this->getCustomerSegmentationData($startOfYear, $endOfYear);
        $topSellingItems = $this->getTopSellingItems($startOfYear, $endOfYear, 10);
        $recentPriceChanges = ItemSellingPricesLog::query()
            ->select([
                'item_selling_prices_logs.id',
                'item_selling_prices_logs.item_id',
                'item_selling_prices_logs.unit_price as new_price',
                'item_selling_prices_logs.created_at',
                DB::raw('(SELECT unit_price FROM item_selling_prices_logs as prev WHERE prev.item_id = item_selling_prices_logs.item_id AND prev.id < item_selling_prices_logs.id ORDER BY prev.id DESC LIMIT 1) as old_price'),
            ])
            ->with(['item.category'])
            ->latest()
            ->take(8)
            ->get()
            ->map(fn ($log) => [
                'item_name' => $log->item->description ?? 'Unknown Item',
                'category' => $log->item->category->name ?? 'N/A',
                'old_price' => (float) ($log->old_price ?? 0),
                'new_price' => (float) $log->new_price,
                'user' => 'System',
                'date' => $log->created_at->format('M d, Y'),
                'is_increase' => ((float) $log->new_price > (float) ($log->old_price ?? 0)),
            ]);

        return [
            'purchasing_sales_head_data' => [
                'kpis' => [
                    'total_revenue' => (float) $currentYearRevenue,
                    'revenue_growth_percentage' => round($revenueGrowth, 1),
                    'total_orders' => Orders::query()->whereBetween('created_at', [$startOfYear, $endOfYear])->count(),
                    'active_customers' => $totalActiveCustomers,
                    'avg_order_value' => $this->calculateAverageOrderValue($startOfYear, $endOfYear),
                ],
                'charts' => [
                    'monthly_sales' => $monthlySales,
                    'category_distribution' => $categoryPerformance,
                    'customer_segmentation' => $customerSegmentation,
                    'top_products' => $topSellingItems,
                ],
                'price_analysis' => $recentPriceChanges,
                'selected_year' => (string) $year,
                'available_years' => $this->getAvailableYears(),
            ],
        ];
    }

    private function getMonthlySalesData(Carbon $start, Carbon $end): array
    {
        $data = DB::table('orders')
            ->where('payment_status', 'fully_paid')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_payable) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        $result = [];
        $current = $start->copy();

        while ($current <= $end) {
            $key = $current->format('Y-m');
            $result[] = [
                'month' => $current->format('M'),
                'total' => (float) ($data[$key] ?? 0),
            ];
            $current->addMonth();
        }

        return $result;
    }

    private function getMonthlySalesBreakdown(Carbon $start, Carbon $end): Collection
    {
        $cashSales = DB::table('payments')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(paid_amount) as total")
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('month')
            ->pluck('total', 'month');

        $creditSales = DB::table('order_credits')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total")
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('month')
            ->pluck('total', 'month');

        $result = collect();
        $current = $start->copy();

        while ($current <= $end) {
            $key = $current->format('Y-m');
            $result->push([
                'month' => $current->format('M'),
                'cash_sales' => (float) ($cashSales[$key] ?? 0),
                'credit_sales' => (float) ($creditSales[$key] ?? 0),
                'total' => (float) (($cashSales[$key] ?? 0) + ($creditSales[$key] ?? 0)),
            ]);
            $current->addMonth();
        }

        return $result;
    }

    private function getCustomerSegmentationData(Carbon $start, Carbon $end): Collection
    {
        return DB::table('orders')
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.payment_status', 'fully_paid')
            ->selectRaw("
                CASE
                    WHEN customers.name LIKE '%Mining%' OR customers.name LIKE '%Hexat%' THEN 'Affiliated'
                    ELSE 'Regular'
                END as type,
                SUM(orders.total_payable) as total_sales,
                COUNT(orders.id) as transaction_count
            ")
            ->groupBy('type')
            ->get();
    }

    private function getCategoryRevenueData(Carbon $start, Carbon $end): Collection
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('items', 'order_items.item_id', '=', 'items.id')
            ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            ->join('item_selling_prices', 'items.id', '=', 'item_selling_prices.item_id')
            ->leftJoin('order_item_serve_locations', 'order_items.id', '=', 'order_item_serve_locations.order_item_id')
            ->where('orders.payment_status', 'fully_paid')
            ->whereBetween('orders.created_at', [$start, $end])
            ->select('item_categories.name', DB::raw('SUM(COALESCE(order_item_serve_locations.quantity_to_serve, 0) * COALESCE(item_selling_prices.unit_price, 0)) as value'))
            ->groupBy('item_categories.id', 'item_categories.name')
            ->orderByDesc('value')
            ->get();
    }

    private function getTopSellingItems(Carbon $start, Carbon $end, int $limit = 5): Collection
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('items', 'order_items.item_id', '=', 'items.id')
            ->leftJoin('order_item_serve_locations', 'order_items.id', '=', 'order_item_serve_locations.order_item_id')
            ->where('orders.payment_status', 'fully_paid')
            ->whereBetween('orders.created_at', [$start, $end])
            ->select(
                'items.description',
                'items.sku',
                DB::raw('SUM(COALESCE(order_item_serve_locations.quantity_to_serve, 0)) as total_qty'),
                DB::raw('COUNT(DISTINCT orders.id) as order_frequency')
            )
            ->groupBy('items.id', 'items.description', 'items.sku')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get();
    }

    private function calculateAverageOrderValue(Carbon $start, Carbon $end): float
    {
        return (float) Orders::query()->whereBetween('created_at', [$start, $end])
            ->where('payment_status', 'fully_paid')
            ->avg('total_payable') ?? 0;
    }

    // private function getPreviousPrice(ItemSellingPricesLog $log): float
    // {
    //     $prev = ItemSellingPricesLog::query()->where('item_id', $log->item_id)
    //         ->where('id', '<', $log->id)
    //         ->orderByDesc('id')
    //         ->first();

    //     return (float) ($prev?->unit_price ?? 0);
    // }

    private function getCreditRatingDistribution(): Collection
    {
        return DB::table('customer_credits')
            ->select('rating', DB::raw('count(*) as count'))
            ->whereNotNull('rating')
            ->groupBy('rating')
            ->orderByDesc('rating')
            ->get()
            ->map(fn ($item) => [
                'stars' => $item->rating,
                'label' => match ((int) $item->rating) {
                    5 => 'Excellent',
                    4 => 'Very Good',
                    3 => 'Good',
                    2 => 'Fair',
                    default => 'New/Poor',
                },
                'count' => $item->count,
            ]);
    }

    private function getAtRiskCustomers(): Collection
    {
        return Customers::whereHas('credit', function ($query) {
            $query->where('rating', '<=', 2)
                ->whereRaw('balance > `limit` * 0.8');
        })
            ->with(['credit'])
            ->limit(10)
            ->get()
            ->map(fn ($customer) => [
                'name' => $customer->name,
                'rating' => $customer->credit->rating,
                'balance' => (float) $customer->credit->balance,
                'utilization' => round(($customer->credit->balance / $customer->credit->limit) * 100, 1),
            ]);
    }

    private function getExecutiveKPIs(Carbon $start, Carbon $end): array
    {
        $revenue = Orders::query()->where('payment_status', 'fully_paid')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_payable');

        $activeCustomersCount = Customers::whereHas('orders', function ($query) {
            $query->where('payment_status', 'fully_paid');
        })->count();

        return [
            'total_revenue' => (float) $revenue,
            'average_order_value' => $this->calculateAverageOrderValue($start, $end),
            'total_credit_outstanding' => (float) DB::table('customer_credits')->sum('balance'),
            'active_customers' => $activeCustomersCount,
        ];
    }

    private function calculateCreditExposure(): array
    {
        $stats = DB::table('customer_credits')
            ->selectRaw('SUM(`limit`) as total_limit, SUM(balance) as total_balance')
            ->first();

        return [
            'total_limit' => (float) $stats->total_limit,
            'total_balance' => (float) $stats->total_balance,
            'exposure_percentage' => $stats->total_limit > 0 ? round(($stats->total_balance / $stats->total_limit) * 100, 2) : 0,
        ];
    }

    public function getEVPDashboardData(int $year): array
    {
        $startOfYear = Carbon::createFromDate($year)->startOfYear();
        $endOfYear = Carbon::createFromDate($year)->endOfYear();

        return [
            'executive_summary' => [
                'kpis' => $this->getExecutiveKPIs($startOfYear, $endOfYear),
                'charts' => [
                    'sales_performance' => $this->getMonthlySalesBreakdown($startOfYear, $endOfYear),
                    'category_distribution' => $this->getCategoryStockDistribution(),
                    'customer_segmentation' => $this->getCustomerSegmentationData($startOfYear, $endOfYear),
                    'credit_rating_distribution' => $this->getCreditRatingDistribution(),
                    'top_performing_items' => $this->getTopSellingItems($startOfYear, $endOfYear, 10),
                    'monthly_sales' => $this->getMonthlySalesData($startOfYear, $endOfYear),
                    'sales_percentage' => $this->getTopSellingItems($startOfYear, $endOfYear, 10),
                    'monthly_sales_summary' => $this->getMonthlySalesBreakdown($startOfYear, $endOfYear),
                ],
                'risk_management' => [
                    'at_risk_customers' => $this->getAtRiskCustomers(),
                    'credit_exposure' => $this->calculateCreditExposure(),
                ],
            ],
            'selected_year' => (string) $year,
            'available_years' => $this->getAvailableYears(),
        ];
    }
}
