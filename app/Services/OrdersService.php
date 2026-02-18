<?php

namespace App\Services;

use App\Data\Orders\CreateOrderData;
use App\Data\Orders\OrderedItemData;
use App\Data\Orders\ProcessOrderReceiptData;
use App\Data\Orders\ServeOrderData;
use App\Data\Orders\VoidOrderData;
use App\Models\Customers;
use App\Models\Items;
use App\Models\OrderItem;
use App\Models\OrderItemServeLocation;
use App\Models\Orders;
use App\Models\PaymentMethods;
use App\Models\StockLocation;
use App\Models\User;
use App\Models\VoidReason;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class OrdersService
{
    public function __construct(
        protected StockService $stockService,
        protected PaymentService $paymentService,
        protected CustomersService $customersService,
        protected NotificationService $notificationService
    ) {}

    public function generateOrderInvoiceNumber($orderId): string
    {
        $datePart = date('Ymd');

        return "INV-$datePart-$orderId";
    }

    public function getManyOrders(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $search = trim($filters['search'] ?? '');

        $queryCallback = function ($query) use ($filters) {
            $query->with([
                'customer' => fn($q) => $q->select('id', 'name', 'customer_img', 'customer_code', 'location_id')
                    ->with('locations:id,country,region,province,municipality,barangay'),
                'order_items.item' => fn($q) => $q->select('id', 'sku', 'image_url', 'description')
                    ->with('sellingPrices:id,item_id,unit_price,wholesale_price,credit_price')
                    ->with('discounts'),
                'order_items.selected_uom:id,name,code',
                'order_items.serve_locations:id,order_item_id,quantity_to_serve',
                'order_items.servedBy:id,first_name,last_name',
                'payment_method:id,name,tag',
                'voucher',
            ]);
            $this->applyFilters($query, $filters);
            $query->latest('created_at');
        };

        if ($search) {
            if (config('scout.driver') === 'database') {
                $query = Orders::query();
                $queryCallback($query);

                $query->where(function ($q) use ($search) {
                    $q->where('orders.id', 'like', "%{$search}%")
                        ->orWhere('orders.invoice_number', 'like', "%{$search}%")
                        ->orWhere('orders.po_number', 'like', "%{$search}%")
                        ->orWhere('orders.total_payable', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('order_items.item', fn($i) => $i->where('description', 'like', "%{$search}%"));

                    if (str_contains(strtoupper($search), 'ORD-')) {
                        $potentialId = (int) filter_var($search, FILTER_SANITIZE_NUMBER_INT);
                        if ($potentialId > 0) {
                            $q->orWhere('orders.id', $potentialId);
                        }
                    }
                });

                return $query->paginate($perPage)->withQueryString();
            }

            return Orders::search($search)->query($queryCallback)->paginate($perPage)->withQueryString();
        }

        $query = Orders::query();
        $queryCallback($query);

        return $query->paginate($perPage)->withQueryString();
    }

    public function getOrdersByUserStatus($status, $authenticatedUserID, array $filters = [], int $perPage = 10)
    {
        $search = trim($filters['search'] ?? '');
        $user = User::with(['roles', 'assigned_stock_locations'])->findOrFail($authenticatedUserID);

        $queryCallback = function ($query) use ($status, $authenticatedUserID, $filters, $user) {
            $userLocationTags = $user->assigned_stock_locations->pluck('tag')->toArray();
            $isIO = $user->roles->contains('code', config('roles.inventory_officer.code'));

            $query->with([
                'customer' => fn($q) => $q->select('id', 'name', 'customer_img', 'customer_code', 'location_id')
                    ->with('locations:id,country,region,province,municipality,barangay'),
                'payment_method:id,name,tag',
                'voucher',
                'order_items.selected_uom:id,name,code',
                'order_items.serve_locations.stock_location:id,tag,name',
                'order_items.servedBy:id,first_name,last_name',
                'order_items.item' => function ($itemQ) {
                    $itemQ->select('id', 'sku', 'image_url', 'description')
                        ->withSum('stocks as total_available_stock', 'available_quantity')
                        ->with(['conversion_units' => fn($q) => $q->orderBy('id', 'asc')->limit(1)])
                        ->with('sellingPrices:id,item_id,unit_price,wholesale_price,credit_price')
                        ->with('discounts');
                },
                'order_items' => function ($orderItemsQ) use ($userLocationTags, $isIO, $status) {
                    if (!$isIO || empty($userLocationTags)) {
                        return;
                    }

                    $orderItemsQ->whereHas('serve_locations', function ($serveLocQ) use ($userLocationTags, $status) {
                        $serveLocQ->whereRelation('stock_location', 'tag', $userLocationTags);
                        $serveLocQ->when($status === Orders::ACTIVE, fn($q) => $q->whereColumn('quantity_to_serve', '>', 'quantity_served'));
                        $serveLocQ->when($status === Orders::COMPLETED, fn($q) => $q->whereColumn('quantity_to_serve', '=', 'quantity_served'));
                    });
                },
            ])
                ->whereHas('order_items', function ($q) use ($status, $authenticatedUserID) {
                    $q->whereHas('order_user_status', fn($sq) => $sq->where('status', $status)->where('user_id', $authenticatedUserID));
                });

            $this->applyFilters($query, $filters);
            $query->latest('created_at');
        };

        if ($search) {
            if (config('scout.driver') === 'database') {
                $query = Orders::query();
                $queryCallback($query);

                $query->where(function ($q) use ($search) {
                    $q->where('orders.id', 'like', "%{$search}%")
                        ->orWhere('orders.invoice_number', 'like', "%{$search}%")
                        ->orWhere('orders.po_number', 'like', "%{$search}%")
                        ->orWhere('orders.total_payable', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('order_items.item', fn($i) => $i->where('description', 'like', "%{$search}%"));

                    if (str_contains(strtoupper($search), 'ORD-')) {
                        $potentialId = (int) filter_var($search, FILTER_SANITIZE_NUMBER_INT);
                        if ($potentialId > 0) {
                            $q->orWhere('orders.id', $potentialId);
                        }
                    }
                });

                return $query->paginate($perPage)->withQueryString();
            }

            return Orders::search($search)->query($queryCallback)->paginate($perPage)->withQueryString();
        }

        $query = Orders::query();
        $queryCallback($query);

        return $query->paginate($perPage)->withQueryString();
    }

    public function serveOrderItem(ServeOrderData $data): void
    {
        DB::transaction(function () use ($data) {
            $serveLocation = OrderItemServeLocation::query()->where('order_item_id', $data->order_item_id)
                ->whereColumn('quantity_served', '<', 'quantity_to_serve')
                ->orderBy('id')
                ->first();

            if (!$serveLocation) {
                return;
            }

            $this->updateOrderItemStatusToSold($serveLocation->order_item);

            $serveLocation->quantity_served += $data->quantity_to_serve;
            $this->updateServeLocationStatus($serveLocation);
            $serveLocation->save();

            $this->deductItemStockBasedLocation($serveLocation->order_item->item, $serveLocation->order_item->selected_uom_id, $serveLocation->stock_location, $data->quantity_to_serve);

            if ($serveLocation->status === config('statuses.order_item.served')) {
                $this->completeOrderUserStatus($serveLocation);
                $orderItem = $serveLocation->order_item;
                $this->notificationService->notify('served', ['inventory:read'], 'order item', $orderItem->item?->description ?? "#{$orderItem->id}");
            }
        });
    }

    public function updateOrderItemStatusToSold(OrderItem $orderItem)
    {
        $orderItem->status = config('statuses.order_item.sold');
        $orderItem->served_by = auth()->id();
        $orderItem->save();
    }

    protected function updateServeLocationStatus(OrderItemServeLocation $loc): void
    {
        if ($loc->quantity_served >= $loc->quantity_to_serve) {
            $loc->status = config('statuses.order_item.served');
            $loc->quantity_served = $loc->quantity_to_serve;

            return;
        }

        if ($loc->quantity_served > 0) {
            $loc->status = config('statuses.order_item.partially_served');
        }
    }

    protected function completeOrderUserStatus(OrderItemServeLocation $loc): void
    {
        $userIds = $loc->stock_location->assigned_users()->pluck('users.id')->toArray();
        $loc->order_item->order_user_status()->whereIn('user_id', $userIds)->update(['status' => Orders::COMPLETED]);
    }

    public function setOrderStatusForSalesOfficerAndCashier($status, $orderItems): void
    {
        $userIds = User::whereHas('roles', fn($q) => $q->whereIn('code', [config('roles.sales_officer.code'), config('roles.cashier.code')]))
            ->pluck('id')
            ->toArray();

        foreach ($orderItems as $item) {
            $item->order_user_status()->syncWithoutDetaching(collect($userIds)->mapWithKeys(fn($id) => [$id => ['status' => $status]])->toArray());
        }
    }

    public function deductItemStockBasedLocation(Items $item, $selectedUomId, $location, $qty)
    {
        $stock = $item->stocks()->where('location_id', $location->id)->first();
        if (!$stock || $qty <= 0) {
            return $stock;
        }

        $baseQty = $qty;
        if ($item->conversion_units()->exists()) {
            $baseQty = $this->stockService->convertSelectedUOMQuantityToBase($qty, $selectedUomId, $item->conversion_units);
        }

        $stock->available_quantity = max(0, $stock->available_quantity - $baseQty);
        $stock->committed_quantity = max(0, $stock->committed_quantity - $baseQty);

        $stock->save();

        return $stock;
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['date_from'] ?? null, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filters['date_to'] ?? null, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($filters['customer_id'] ?? null, fn($q, $id) => $q->where('customer_id', $id));
    }

    public function createCompleteOrder(CreateOrderData $data): Orders
    {
        return DB::transaction(function () use ($data) {
            $paymentMethodTag = $data->payment_method->tag ?? null;

            if (!$data->is_draft && $paymentMethodTag === PaymentMethods::CREDIT) {
                $customer = Customers::with('credit')->find($data->customer_id);

                $this->checkCustomerCreditAvailability($customer, $data->total_payable, $data);

                $currentBalance = $customer->credit->balance ?? 0;
                $creditLimit = $customer->credit->limit ?? 0;
                $newBalance = $currentBalance + $data->total_payable;

                $this->validateCreditLimitOverride($data, $newBalance, $creditLimit);
            }

            if (!empty($data->draft_id)) {
                $oldDraft = Orders::query()->find($data->draft_id);
                if ($oldDraft?->is_draft) {
                    $oldDraft->delete($oldDraft->id);
                }
            }

            $order = Orders::create([
                'customer_id' => $data->customer_id,
                'payment_method_id' => $data->payment_method->id,
                'total_payable' => $data->total_payable,
                'used_voucher' => $data->used_voucher ?? null,
                'vouchers_used' => $data->vouchers_used ?? null,
                'is_draft' => $data->is_draft,
                'user_id' => auth()->id(),
                'po_number' => $data->po_number ?? null,
            ]);

            foreach ($data->ordered_items as $orderedItem) {
                $this->processOrderedItem($order, $orderedItem);
            }

            $order->load('order_items');

            if (!$data->is_draft) {
                $this->setOrderStatusForSalesOfficerAndCashier(Orders::ACTIVE, $order->order_items);

                if ($paymentMethodTag === PaymentMethods::CREDIT) {
                    $this->paymentService->recordOrderCredits($data->total_payable, $order);
                    $customer = Customers::find($data->customer_id);
                    $this->customersService->increaseCustomerCreditBalance($data->total_payable, $customer, true);
                }

                $order->refresh();
                $this->notificationService->notify('created new', ['create_order:read'], 'order', "#{$order->id}");
            } else {
                $this->notificationService->notify('saved as draft', ['create_order:read'], 'order', "#{$order->id}");
            }

            return $order;
        });
    }

    public function getDraftOrders(int $limit = 20)
    {
        return Orders::query()->where('is_draft', true)
            ->where('user_id', auth()->id())
            ->with([
                'customer' => function ($query) {
                    $query->with(['locations:id,country,region,province,municipality,barangay']);
                },
                'payment_method:id,name,tag',
                'order_items.serve_locations',
                'order_items.item' => function ($q) {
                    $q->select('id', 'sku', 'image_url', 'description')
                        ->with('sellingPrices')
                        ->with('conversion_units')
                        ->with('discounts')
                        ->with('stocks');
                },
                'order_items.selected_uom:id,name,code',
            ])
            ->latest()
            ->limit($limit)
            ->get();
    }

    protected function processOrderedItem(Orders $order, OrderedItemData $orderedItem): void
    {

        $item = Items::with(['conversion_units' => fn($q) => $q->orderBy('id', 'desc')])
            ->findOrFail($orderedItem->id);

        $stockLocations = StockLocation::with(['stock' => fn($q) => $q->where('item_id', $item->id)->orderBy('created_at', 'asc')])
            ->whereHas('stock', fn($q) => $q->where('item_id', $item->id))
            ->orderBy('created_at', 'asc')
            ->get();

        $orderedQty = $orderedItem->quantity;
        $selectedUomId = $orderedItem->selected_uom_id;

        foreach ($stockLocations as $location) {
            if ($orderedQty <= 0) {
                break;
            }

            $stock = $location->stock->first();
            $availableBaseQty = $stock ? $stock->available_quantity : 0;
            $committedBaseQty = $stock ? $stock->committed_quantity : 0;

            $trueAvailableBaseQty = $availableBaseQty - $committedBaseQty;

            $availableInUom = $this->stockService->convertBaseQuantityToSelectedUom($trueAvailableBaseQty, $item->conversion_units, $selectedUomId);

            if ($availableInUom <= 0) {
                continue; // If no stock, move to another location
            }

            if ($orderedQty > $availableInUom) {

                // Serve what's available in the current stock location
                $this->createAndServeItemOrdered($order, $item, $location, $selectedUomId, $availableInUom);

                $mainUomFirstConversionUnits = $item->conversion_units->reverse()->values()->all();

                $convertedQty = $this->stockService->convertSelectedUOMQuantityToBase($availableInUom, $selectedUomId, $mainUomFirstConversionUnits);

                $this->addStockCommittedQty($stock, $committedBaseQty, $convertedQty);

                $orderedQty -= $availableInUom;

                continue; // Move to next stock location to avoid over stockout
            }

            $this->createAndServeItemOrdered($order, $item, $location, $selectedUomId, $orderedQty);

            $mainUomFirstConversionUnits = $item->conversion_units->reverse()->values()->all();
            $convertedQty = $this->stockService->convertSelectedUOMQuantityToBase($orderedQty, $selectedUomId, $mainUomFirstConversionUnits);

            $this->addStockCommittedQty($stock, $committedBaseQty, $convertedQty);

            $orderedQty -= $orderedQty;
        }
    }

    public function createAndServeItemOrdered(Orders $order, Items $item, $stockLocation, $selectedUomId, $qtyToServe)
    {
        $orderItem = $order->order_items()->create([
            'item_id' => $item->id,
            'selected_uom_id' => $selectedUomId,
        ]);

        $orderItem->serve_locations()->create([
            'stock_location_id' => $stockLocation->id,
            'quantity_to_serve' => $qtyToServe,
            'status' => config('statuses.order_item.unserved'),
        ]);
    }

    public function addStockCommittedQty($stock, $currQty, $newQty)
    {
        if ($stock) {
            $stock->committed_quantity = $currQty + $newQty;
            $stock->save();
        }
    }

    public function setOrderStatusForInventoryOfficer($status, $orderItems): void
    {
        $inventoryOfficers = User::whereRelation('roles', 'code', config('roles.inventory_officer.code'))
            ->with('assigned_stock_locations:id,tag')
            ->get();

        foreach ($inventoryOfficers as $io) {
            $ioTags = $io->assigned_stock_locations->pluck('tag')->toArray();

            if (empty($ioTags)) {
                continue;
            }

            $targetItems = $orderItems->filter(function ($item) use ($ioTags) {
                $serveLocations = $item->serve_locations;

                if ($serveLocations?->stock_location) {
                    return \in_array($serveLocations->stock_location->tag, $ioTags);
                }

                return false;
            });

            foreach ($targetItems as $item) {
                $item->order_user_status()->syncWithoutDetaching([$io->id => ['status' => $status]]);
            }
        }
    }

    public function processOrderReceipt(ProcessOrderReceiptData $data)
    {
        $result = DB::transaction(function () use ($data) {
            $order = Orders::with([
                'order_items.item',
                'order_items.serve_locations.stock_location',
                'payment_method',
                'customer.credit',
            ])->findOrFail($data->order_id);

            $updateData = ['total_payable' => $data->total_payable];

            if ($data->used_voucher !== null) {
                $updateData['used_voucher'] = $data->used_voucher;
            }
            if ($data->vouchers_used !== null) {
                $updateData['vouchers_used'] = $data->vouchers_used;
            }

            $order->fill($updateData)->save();
            $paymentMethod = $order->payment_method;

            $cashLikePaymentMethods = [
                PaymentMethods::CASH,
                PaymentMethods::BANK_TRANSFER,
                PaymentMethods::CHECK,
            ];

            // Process cash and cash like payment methods
            if (\in_array($paymentMethod?->tag ?? null, $cashLikePaymentMethods, true)) {
                $dataToUse = $data;
                if ($data->paid_amount !== null) {
                    $dataToUse = new ProcessOrderReceiptData(
                        $data->order_id,
                        $data->total_payable,
                        min($data->paid_amount, $data->total_payable),
                        $data->used_voucher,
                        $data->vouchers_used,
                        $data->with_tax,
                        $data->override_email,
                        $data->override_password
                    );
                }

                $this->paymentService->processPayment($order, $dataToUse);
            }

            // if (($paymentMethod?->tag ?? null) === PaymentMethods::CREDIT) {
            //     $customer = $order->customer;

            //     $this->checkCustomerCreditAvailability($customer, $data->total_payable, $data);
            //     $currentBalance = $customer->credit->balance ?? 0;
            //     $creditLimit = $customer->credit->limit ?? 0;
            //     $newBalance = $currentBalance + $data->total_payable;
            //     $this->validateCreditLimitOverride($data, $newBalance, $creditLimit);

            //     if (!$order->credits()->exists()) {
            //         $this->paymentService->recordOrderCredits($data->total_payable, $order);
            //         $this->customersService->increaseCustomerCreditBalance($data->total_payable, $customer, true);
            //     }
            // }

            if ($data->with_tax) {
                $totalTaxAmount = $this->computeTaxPerTotalPayable($data->total_payable);
                $this->recordOrderTax($order, $totalTaxAmount);
            }

            $this->setOrderStatusForSalesOfficerAndCashier(Orders::COMPLETED, $order->order_items);
            $this->setOrderStatusForInventoryOfficer(Orders::ACTIVE, $order->order_items);
            $this->notificationService->notify('processed receipt for', ['create_order:read'], 'order', "#{$order->id}");

            return ['order' => $order];
        });

        return $result;
    }

    public function recordOrderTax(Orders $order, $totalTaxAmount)
    {
        if ($totalTaxAmount && $totalTaxAmount > 0) {
            $order->tax()->create([
                'amount' => $totalTaxAmount,
            ]);
        }
    }

    public function computeTaxPerTotalPayable(float $totalPayable)
    {
        // PH VAT
        $taxRate = 1.12;

        // Extract the amount after tax
        $netAmount = round($totalPayable / $taxRate, 2);

        $totalTaxAmount = $totalPayable - $netAmount;

        return $totalTaxAmount;
    }

    public function getAllItemsOrderedByCustomer($customerId)
    {
        $customer = Customers::query()->find($customerId);
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found.',
                'items' => [],
            ], 404);
        }

        $orders = Orders::query()->where('customer_id', $customerId)
            ->where('is_void', false)
            ->get();

        $orderIds = $orders->pluck('id');

        $orderItems = OrderItem::with(['serve_locations', 'selected_uom', 'item'])
            ->whereIn('order_id', $orderIds)
            ->get();

        $items = $orderItems->map(fn($orderItem) => [
            'order_id' => $orderItem['order_id'],
            'order_item_id' => $orderItem['id'],
            'item_id' => $orderItem['item'] ? $orderItem['item']['id'] : null,
            'item_name' => $orderItem['item'] ? $orderItem['item']['description'] : null,
            'quantity_ordered' => $orderItem['serve_locations']->first()['quantity_to_serve'] ?? 0,
            'selected_uom' => $orderItem['selected_uom'],
            'sku' => $orderItem['item'] ? $orderItem['item']['sku'] : null,
            'brand' => $orderItem['item'] ? $orderItem['item']['brand'] : null,
            'color' => $orderItem['item'] ? $orderItem['item']['color'] : null,
            'size' => $orderItem['item'] ? $orderItem['item']['size'] : null,
        ]);

        return $items;
    }

    public function voidOrder(VoidOrderData $data): void
    {
        $voidReason = VoidReason::query()->with('roles_require_credentials')->find($data->void_id);

        if (!$voidReason) {
            throw ValidationException::withMessages(['error' => 'Void Reason Not Found']);
        }

        if ($voidReason->require_password) {
            $user = User::with('roles')->where('email', $data->email)->first();

            if (!$user || !Hash::check($data->password ?? '', $user->password)) {
                throw ValidationException::withMessages(['error' => 'Invalid email or password.']);
            }

            $requiredRoleIDs = $voidReason->roles_require_credentials->pluck('role_id')->toArray();
            $userRoleIDs = $user->roles->pluck('id')->toArray();

            if (empty(array_intersect($userRoleIDs, $requiredRoleIDs))) {
                $this->validateVoidOverride($data);
            }
        }

        DB::transaction(function () use ($data) {
            $order = Orders::with('order_items')->findOrFail($data->order_id);

            $order->update([
                'is_void' => true,
                'payment_status' => Orders::CANCELLED,
                'void_reason_id' => $data->void_id,
            ]);

            foreach ($order->order_items as $orderItem) {
                $orderItem->order_user_status()->update(['status' => Orders::CANCELLED]);
            }

            $this->notificationService->notify('voided', ['create_order:read'], 'order', "#{$data->order_id}");
        });
    }

    protected function validateVoidOverride(VoidOrderData $data): void
    {
        if (empty($data->override_email) || empty($data->override_password)) {
            throw ValidationException::withMessages(['error' => 'Entered user credentials do not have permission to perform this void operation.']);
        }

        $user = User::with('roles')->where('email', $data->override_email)->first();

        if (!$user || !Hash::check($data->override_password, $user->password)) {
            throw ValidationException::withMessages([
                'error' => 'Invalid override credentials.',
            ]);
        }

        $authorizedRoleCodes = [
            config('roles.evp.code'),
            config('roles.purchase_sales_head.code'),
        ];

        $userRoleCodes = $user->roles->pluck('code')->toArray();
        $hasAuthorizedRole = !empty(array_intersect($userRoleCodes, $authorizedRoleCodes));

        if (!$hasAuthorizedRole) {
            throw ValidationException::withMessages([
                'error' => 'User does not have permission to override void reason. Only EVP or Purchasing Sales Head can authorize.',
            ]);
        }
    }

    public function getAllInvoiceNumbersByCustomer($customerId)
    {
        $customer = Customers::query()->find($customerId);
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found.',
                'invoice_numbers' => [],
            ], 404);
        }

        $invoices = Orders::query()
            ->where('customer_id', $customerId)
            ->where('is_void', false)
            ->pluck('invoice_number')
            ->unique()
            ->values();

        return $invoices;
    }

    public function getTotalAmountReturnedPerOrder($order)
    {
        $totalReturnsSales = 0;
        foreach ($order->order_items as $orderItem) {
            if ($orderItem?->item?->sellingPrices) {
                $unitPrice = optional($orderItem->item->sellingPrices)->unit_price ?? 0;
                $sumQuantity = collect($orderItem->item->returned_from_customer_items)
                    ->where('invoice_number', $order->invoice_number)
                    ->where('status', config('statuses.returns_from_customer.approved'))
                    ->sum(fn($returnItem) => $returnItem['pivot']['quantity'] ?? 0);
                $totalReturnsSales += $sumQuantity * $unitPrice;
            }
        }

        return $totalReturnsSales;
    }

    protected function verifyOverrideCredentials($email, $password): void
    {
        if (empty($email) || empty($password)) {
            return;
        }

        $user = User::with('roles')->where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'override_credentials' => 'Invalid override credentials.',
            ]);
        }

        $authorizedRoleCodes = [
            config('roles.evp.code'),
            config('roles.purchase_sales_head.code'),
        ];

        $userRoleCodes = $user->roles->pluck('code')->toArray();
        $hasAuthorizedRole = !empty(array_intersect($userRoleCodes, $authorizedRoleCodes));

        if (!$hasAuthorizedRole) {
            throw ValidationException::withMessages([
                'override_credentials' => 'User does not have permission to override credit limit. Only EVP or Purchasing Sales Head can authorize.',
            ]);
        }
    }

    protected function validateCreditLimitOverride($data, float $newBalance, float $creditLimit): void
    {
        $exceedsLimit = $newBalance > $creditLimit;

        if (!$exceedsLimit) {
            return;
        }

        $overrideEmail = $data->override_email ?? request('override_email');
        $overridePassword = $data->override_password ?? request('override_password');

        if (empty($overrideEmail) || empty($overridePassword)) {
            throw ValidationException::withMessages([
                'credit_limit' => 'Credit limit exceeded. New balance (₱' . number_format($newBalance, 2) . ') exceeds limit (₱' . number_format($creditLimit, 2) . '). EVP or Purchasing Sales Head authorization required.',
            ]);
        }

        $this->verifyOverrideCredentials($overrideEmail, $overridePassword);
    }

    public function checkCustomerCreditAvailability(Customers $customer, $totalPayable, $data = null)
    {
        $overrideEmail = $data->override_email ?? request('override_email');
        $overridePassword = $data->override_password ?? request('override_password');

        if (!$customer?->credit) {
            if (!empty($overrideEmail) && !empty($overridePassword)) {
                $this->verifyOverrideCredentials($overrideEmail, $overridePassword);

                return;
            }

            throw ValidationException::withMessages([
                'credit_limit' => 'Customer does not have available credit for credit payment. EVP or Purchasing Sales Head authorization required.',
            ]);
        }

    }
}
