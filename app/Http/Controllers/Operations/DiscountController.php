<?php

namespace App\Http\Controllers\Operations;

use App\Data\Operations\CreateDiscountData;
use App\Data\Operations\DeleteDiscountData;
use App\Data\Operations\UpdateDiscountData;
use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Services\DiscountService;
use App\Services\ItemCategoryService;
use App\Services\ItemsService;
use App\Services\SupplierService;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function __construct(
        protected DiscountService $discountService,
        protected SupplierService $supplierService,
        protected ItemCategoryService $categoryService,
        protected ItemsService $itemsService,
    ) {}

    public function renderDiscountPage()
    {
        $filters = [
            'search' => request()->get('search'),
            'discount_type' => request()->get('discount_type'),
            'date_from' => request()->get('date_from'),
            'date_to' => request()->get('date_to'),
        ];

        $perPage = request()->get('per_page', 10);

        $discounts = $this->discountService->getManyDiscounts($filters, (int) $perPage);

        return Inertia::render('operations/discounts', [
            'discounts' => $discounts,
            'filters' => $filters,
            'supplier' => $this->supplierService->getAllSuppliers(['id', 'name']),
            'categories' => $this->categoryService->getAllItemCategories(['id', 'code', 'name']),
            'items' => $this->itemsService->getAllItems(),
        ]);
    }

    public function createDiscount(CreateDiscountData $data)
    {
        $this->discountService->createDiscount($data);

        return back()->with('success', 'Discount created successfully');
    }

    public function updateDiscount(UpdateDiscountData $data, Discount $discount)
    {
        $this->discountService->updateDiscount($discount, $data);

        return back()->with('success', 'Discount updated successfully');
    }

    public function deleteDiscount(Discount $discount)
    {
        $data = new DeleteDiscountData($discount->id);

        $this->discountService->deleteDiscount($data);

        return back()->with('success', 'Discount deleted successfully');
    }
}
