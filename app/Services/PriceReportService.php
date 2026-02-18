<?php

namespace App\Services;

use App\Models\Items;
use Carbon\Carbon;

class PriceReportService
{
    /**
     * Get the main Price Report table data.
     */
    public function getAllItemsPriceReport(?string $startDate = null, ?string $endDate = null)
    {
        $currentYear = now()->year;

        // 1. Fetch Items with Eager Loading
        $items = Items::select(['id', 'description', 'sku', 'brand', 'color', 'size', 'category_id'])
            ->with([
                'category:id,code,name',
                'sellingPrices:id,item_id,unit_price,wholesale_price,credit_price',

                // Get purchase logs only for the current year
                'purchase_price_logs' => fn ($q) => $q->whereYear('created_at', $currentYear)->orderBy('created_at'),

                // Get latest purchase
                'purchased_items' => fn ($q) => $q->orderByDesc('created_at'),

                // Filter Order Items by Date Range to get accurate "Total Sold"
                'order_items' => function ($query) use ($startDate, $endDate) {
                    $query->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                    });
                },
                'order_items.serve_locations:id,order_item_id,quantity_to_serve,quantity_served',
            ])
            ->get();

        // 2. Process metrics for each item
        return $items->map(function ($item) {
            return $this->processItemMetrics($item);
        });
    }

    /**
     * Get Total Revenue (Top Profitable Items).
     * Note: Currently calculates revenue based on the Order total, attributed to the item.
     */
    public function getTotalRevenue(?string $startDate, ?string $endDate)
    {
        $items = Items::with([
            'order_items' => function ($query) use ($startDate, $endDate) {
                $query->when($startDate && $endDate, fn ($q) => $q->whereBetween('created_at', [$startDate, $endDate]));
            },
            'order_items.order.payments',
            'order_items.order.credits',
        ])->get();

        $revenueByItem = [];

        foreach ($items as $item) {
            // Skip items that have no orders in this period to save processing
            if ($item->order_items->isEmpty()) {
                continue;
            }

            $description = $item->description;
            $itemRevenue = 0;

            foreach ($item->order_items as $orderItem) {
                if (! $orderItem->order) {
                    continue;
                }

                // logic: summing total order revenue
                $itemRevenue += $this->calculateOrderRevenue($orderItem->order);
            }

            if (! isset($revenueByItem[$description])) {
                $revenueByItem[$description] = [
                    'description' => $description,
                    'total_revenue' => 0,
                ];
            }

            $revenueByItem[$description]['total_revenue'] += $itemRevenue;
        }

        return collect($revenueByItem)
            ->sortByDesc('total_revenue')
            ->values()
            ->toArray();
    }

    /**
     * Get Fast or Slow moving items based on order frequency.
     */
    public function getMovingItems(?string $startDate, ?string $endDate, string $sortType)
    {
        $items = Items::with([
            'order_items' => function ($query) use ($startDate, $endDate) {
                $query->when($startDate && $endDate, fn ($q) => $q->whereBetween('created_at', [$startDate, $endDate]));
                $query->orderBy('created_at'); // Order by date at DB level for easier diffing
            },
        ])->get();

        $processedItems = $items->map(function ($item) {
            // Get dates directly from the sorted relation
            $dates = $item->order_items->pluck('created_at')->map(fn ($d) => Carbon::parse($d));

            return [
                'id' => $item->id,
                'description' => $item->description,
                'average_order_difference_days' => $this->calculateAverageDaysDiff($dates),
            ];
        });

        $sortDesc = strtolower($sortType) === 'fast'; // Fast = Small diff (0 days), Slow = Large diff (100 days)

        return $processedItems
            ->sortBy(fn ($item) => $item['average_order_difference_days'], SORT_REGULAR, $sortDesc)
            ->values();
    }

    // =========================================================================
    //  PRIVATE HELPER METHODS (Clean up the main logic)
    // =========================================================================

    private function processItemMetrics($item)
    {
        // 1. Handle Purchase Logs (First vs Last of Year)
        $logs = $item->purchase_price_logs->sortBy('created_at')->values();
        $filteredLogs = collect();
        if ($logs->isNotEmpty()) {
            $filteredLogs->push($logs->first());
            if ($logs->count() > 1) {
                $filteredLogs->push($logs->last());
            }
        }
        $item->setRelation('purchase_price_logs', $filteredLogs);

        // 2. Calculate Margins
        $this->calculateMarginAttributes($item, $filteredLogs);

        // 3. Calculate Total Sold (Based on the filtered order_items)
        $item->total_sold = $item->order_items->sum(fn ($oi) => $oi->serve_locations?->quantity_to_serve ?? 0);

        // 4. Attach Latest Purchased Item
        $latestPurchase = $item->purchased_items->sortByDesc('created_at')->first();
        $item->setRelation('purchased_items', $latestPurchase);

        // 5. Cleanup relations to keep JSON response light
        $item->unsetRelation('order_items');

        return $item;
    }

    private function calculateMarginAttributes($item, $logs)
    {
        if ($logs->count() < 2) {
            $item->purchase_price_margin_percent = null;
            $item->purchase_price_margin_classification = null;

            return;
        }

        $firstPrice = (float) $logs->first()->unit_price;
        $lastPrice = (float) $logs->last()->unit_price;

        if ($firstPrice == 0) {
            $item->purchase_price_margin_percent = null;
            $item->purchase_price_margin_classification = null;

            return;
        }

        $margin = (($lastPrice - $firstPrice) / $firstPrice) * 100;
        $item->purchase_price_margin_percent = round($margin, 2);

        $item->purchase_price_margin_classification = match (true) {
            $lastPrice > $firstPrice => 'increased',
            $lastPrice < $firstPrice => 'decreased',
            default => 'no change',
        };
    }

    private function calculateOrderRevenue($order)
    {
        return $order->payments->sum('paid_amount') + $order->credits->sum('amount');
    }

    private function calculateAverageDaysDiff($dates)
    {
        if ($dates->count() < 2) {
            return 0;
        } // Or null, depending on preference

        $diffs = [];
        for ($i = 1; $i < $dates->count(); $i++) {
            $diffs[] = $dates[$i - 1]->diffInDays($dates[$i]);
        }

        return count($diffs) > 0 ? array_sum($diffs) / count($diffs) : 0;
    }
}
