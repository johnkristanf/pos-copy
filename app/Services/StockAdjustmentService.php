<?php

namespace App\Services;

use App\Data\Items\StockAdjustData;
use App\Models\Features; // Import this
use App\Models\ReturnsProcessRole; // Or your specific StockAdjustmentProcessRole
use App\Models\Stock;
use App\Models\StockAdjustment;
use App\Models\User; // Import this
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockAdjustmentService
{
    public function __construct(
        protected StockService $stockService,
        protected NotificationService $notificationService
    ) {}

    public function getManyStockAdjustment(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        // 1. Get Status and Search
        $status = ! empty($filters['status']) ? $filters['status'] : 'pending';
        $search = trim($filters['search'] ?? '');

        // 2. Define Relations to Load
        $loadRelations = [
            'item:id,sku,description,brand,color,size,category_id,supplier_id',
            'item.category:id,name,code',
            'stockLocation:id,name,tag',
            'preparer:id,first_name,last_name',
            'checker:id,first_name,last_name',
            'approver:id,first_name,last_name',
            'rejecter:id,first_name,last_name',
        ];

        // 3. Determine User Roles
        $user = User::with('roles')->find(Auth::id());
        $roleIds = $user->roles->pluck('id')->toArray();

        // Assuming you have a feature tag for 'stock_adjustment' in config
        $feature = Features::query()->where('tag', config('features.stock_adjustment.tag') ?? 'stock_adjustment')->first();

        $processRole = null;
        if ($feature) {
            // Using ReturnsProcessRole as per your example, strictly strictly speaking
            // you might want a generic ProcessRole model
            $processRole = ReturnsProcessRole::query()
                ->whereIn('role_id', $roleIds)
                ->where('feature_id', $feature->id)
                ->first();
        }

        // 4. Build Query Callback
        $queryCallback = function ($query) use ($loadRelations, $filters, $status, $processRole, $user) {
            $query->with($loadRelations);

            // Apply Role Based Filter
            $this->applyRoleFilter($query, $status, $processRole, $user->id);

            // Apply Search/Date/Location Filters
            $this->applyOtherFilters($query, $filters);
        };

        // 5. Execute Search or Standard Query
        if ($search) {
            // Assuming you have Scout or a search scope on StockAdjustment
            // If not, use standard where clauses in applyOtherFilters
            return StockAdjustment::whereHas('item', fn ($iq) => $iq->where('sku', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
            )
                ->tap($queryCallback) // tap allows us to modify the builder
                ->paginate($perPage)
                ->withQueryString();
        }

        $query = StockAdjustment::query();
        $queryCallback($query);

        return $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function applyRoleFilter($query, string $tabStatus, ?ReturnsProcessRole $processRole, int $userId): void
    {
        $roleType = $processRole?->type;

        // --- CHECKER LOGIC ---
        if ($roleType === ReturnsProcessRole::CHECKER) {
            if ($tabStatus === 'pending') {
                $query->where('status', config('statuses.adjustments.for_checking'));
            } elseif ($tabStatus === 'approved') {
                $query->where('checked_by', $userId);
            } elseif ($tabStatus === 'rejected') {
                $query->where('rejected_by', $userId);
            }

            return;
        }

        // --- APPROVER LOGIC ---
        if ($roleType === ReturnsProcessRole::APPROVER) {
            if ($tabStatus === 'pending') {
                $query->where('status', config('statuses.adjustments.for_approval'));
            } elseif ($tabStatus === 'approved') {
                $query->where('approved_by', $userId);
            } elseif ($tabStatus === 'rejected') {
                $query->where('rejected_by', $userId);
            }

            return;
        }

        // --- PREPARER (DEFAULT) LOGIC ---
        $query->where('prepared_by', $userId);

        if ($tabStatus === 'pending') {
            $query->whereIn('status', [
                config('statuses.adjustments.for_checking') ?? 'for_checking',
                config('statuses.adjustments.for_approval') ?? 'for_approval',
            ]);
        } elseif ($tabStatus === 'approved') {
            $query->where('status', config('statuses.adjustments.approved'));
        } elseif ($tabStatus === 'rejected') {
            $query->where('status', config('statuses.adjustments.rejected') ?? 'rejected');
        }
    }

    protected function applyOtherFilters($query, array $filters): void
    {
        if (! empty($filters['date_after'])) {
            $query->whereDate('created_at', '>=', $filters['date_after']);
        }

        if (! empty($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        // Manual search implementation if not using Laravel Scout
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('item', fn ($iq) => $iq->where('sku', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
            );
        }
    }

    // ... create, approve, reject methods below need updates too ...

    public function createStockAdjustments(StockAdjustData $data): void
    {
        DB::transaction(function () use ($data) {
            $createdCount = 0;
            $authenticatedUserID = Auth::id();

            foreach ($data->adjust_details as $detail) {
                StockAdjustment::create([
                    'quantity' => $detail->quantity,
                    'action' => $detail->action,
                    'item_id' => $detail->item_id,
                    'location_id' => $detail->location_id,
                    // Track the preparer
                    'prepared_by' => $authenticatedUserID,
                    // Set initial status (e.g., for checking)
                    'status' => config('statuses.adjustments.for_checking') ?? 'pending',
                ]);
                $createdCount++;
            }

            $label = $createdCount === 1 ? 'stock adjustment' : "{$createdCount} stock adjustments";
            $this->notificationService->notify('created new', ['inventory:read'], $label, '');
        });
    }

    // Add setChecked method if you have a checker step
    public function setStockAdjustmentToChecked(StockAdjustment $stockAdjustment): void
    {
        $stockAdjustment->checked_by = Auth::id();
        $stockAdjustment->status = config('statuses.adjustments.for_approval');
        $stockAdjustment->save();

        // Notify...
    }

    public function approveStockAdjustment(StockAdjustment $stockAdjustment): void
    {
        DB::transaction(function () use ($stockAdjustment) {
            $stock = Stock::query()->where('item_id', $stockAdjustment->item_id)
                ->where('location_id', $stockAdjustment->location_id)
                ->with('items')
                ->lockForUpdate()
                ->first();

            $selectedStockItem = $stock?->items;
            $baseQuantity = $stockAdjustment->quantity;

            if ($selectedStockItem && method_exists($selectedStockItem, 'conversion_units') && $selectedStockItem->conversion_units()->exists()) {
                $baseQuantity = $this->stockService->convertItemQuantityUptoBase($baseQuantity, $selectedStockItem->conversion_units);
            }

            if ($stock) {
                $this->stockService->stockAdjustByAction($stockAdjustment->action, $stock, $baseQuantity);
            }

            // Update status and Approver ID
            $stockAdjustment->status = config('statuses.adjustments.approved');
            $stockAdjustment->approved_by = Auth::id();
            $stockAdjustment->save();

            $itemDescription = $stockAdjustment->item?->description ?? "#{$stockAdjustment->id}";
            $this->notificationService->notify('approved', ['inventory:read'], 'stock adjustment for', $itemDescription);
        });
    }

    public function rejectStockAdjustment(StockAdjustment $stockAdjustment): void
    {
        if ($stockAdjustment->status === config('statuses.adjustments.approved')) {
            throw new \Exception('Cannot reject an already approved adjustment.');
        }

        // Update Status and Rejecter ID
        $stockAdjustment->status = config('statuses.adjustments.rejected') ?? 'rejected';
        $stockAdjustment->rejected_by = Auth::id();
        $stockAdjustment->save();

        $itemDescription = $stockAdjustment->item?->description ?? "#{$stockAdjustment->id}";
        $this->notificationService->notify('rejected', ['inventory:read'], 'stock adjustment for', $itemDescription);
    }
}
