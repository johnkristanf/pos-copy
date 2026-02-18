<?php

namespace App\Services;

use App\Data\Items\StockTransferData;
use App\Http\Resources\Items\StockTransferResource;
use App\Models\Stock;
use App\Models\StockTransfer;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class StockTransferService
{
    public function __construct(
        protected StockService $stockService,
        protected NotificationService $notificationService
    ) {}

    public function getManyStockTransfers(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return StockTransfer::query()
            ->with([
                'item:id,sku,description,brand,color,size,category_id,supplier_id',
                'source_stock_location:id,name,tag',
                'destination_stock_location:id,name,tag',
            ])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('item', fn ($iq) => $iq->where('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                );
            })
            ->when($filters['source_location_id'] ?? null, function ($q, $locationId) {
                $q->where('source_location_id', $locationId);
            })
            ->when($filters['destination_location_id'] ?? null, function ($q, $locationId) {
                $q->where('destination_location_id', $locationId);
            })
            ->when($filters['date_from'] ?? null, function ($q, $date) {
                $q->where('created_at', '>=', $date);
            })
            ->when($filters['date_to'] ?? null, function ($q, $date) {
                $q->where('created_at', '<=', $date);
            })
            ->latest('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(StockTransferResource::transform(...));
    }

    public function transferStock(StockTransferData $data): void
    {
        DB::transaction(function () use ($data) {
            $transferredItems = [];

            foreach ($data->selected_items_to_transfer as $itemTransfer) {
                $sourceStock = $this->stockService->fetchItemStockByStockLocationID(
                    $itemTransfer->item_id,
                    $itemTransfer->source_stock_location_id
                );

                if (! $sourceStock) {
                    throw new \Exception("Source stock record not found for Item ID: {$itemTransfer->item_id} at Location ID: {$itemTransfer->source_stock_location_id}");
                }

                $item = $sourceStock->items;
                $quantityToTransfer = $itemTransfer->quantity_to_transfer;
                $baseQuantityToTransfer = $quantityToTransfer;

                if ($item && isset($item->conversion_units) && \count($item->conversion_units) > 0) {
                    $baseQuantityToTransfer = $this->stockService->convertItemQuantityUptoBase($quantityToTransfer, collect($item->conversion_units));
                }

                $this->stockService->stockAdjustByAction(Stock::DEDUCT, $sourceStock, $baseQuantityToTransfer);

                $destinationStock = $this->stockService->fetchItemStockByStockLocationID(
                    $itemTransfer->item_id,
                    $itemTransfer->destination_stock_location_id
                );

                if ($destinationStock) {
                    $this->stockService->stockAdjustByAction(Stock::INCREASE, $destinationStock, $baseQuantityToTransfer);
                } else {
                    $destinationStock = Stock::create([
                        'item_id' => $itemTransfer->item_id,
                        'location_id' => $itemTransfer->destination_stock_location_id,
                        'available_quantity' => $baseQuantityToTransfer,
                        'committed_quantity' => 0,
                    ]);
                }

                StockTransfer::create([
                    'item_id' => $itemTransfer->item_id,
                    'source_stock_location_id' => $itemTransfer->source_stock_location_id,
                    'destination_stock_location_id' => $itemTransfer->destination_stock_location_id,
                    'quantity' => $quantityToTransfer,
                ]);

                $transferredItems[] = $item?->description ?? "Item #{$itemTransfer->item_id}";
            }

            $itemCount = \count($transferredItems);
            $label = $itemCount === 1 ? $transferredItems[0] : "{$itemCount} items";
            $this->notificationService->notify('transferred stock for', ['inventory:read'], '', $label);
        });
    }
}
