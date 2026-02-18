<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\CreateCategoryData;
use App\Data\Items\GetManyCategoriesData;
use App\Data\Items\UpdateCategoryData;
use App\Http\Controllers\Controller;
use App\Models\ItemCategory;
use App\Services\ItemCategoryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoriesController extends Controller
{
    public function __construct(
        protected ItemCategoryService $categoryService,
    ) {}

    public function renderCategoryPage(GetManyCategoriesData $data): Response
    {
        return Inertia::render('items/category', [
            'categories' => $this->categoryService->getManyCategories($data),
        ]);
    }

    public function createCategory(CreateCategoryData $data): RedirectResponse
    {
        $this->categoryService->createCategory($data);

        return back()->with('success', 'Item category created successfully.');
    }

    public function updateCategory(UpdateCategoryData $data, ItemCategory $category): RedirectResponse
    {
        $this->categoryService->updateCategory($category, $data);

        return back()->with('success', 'Item category updated successfully.');
    }

    public function deleteCategory(ItemCategory $category): RedirectResponse
    {
        $this->categoryService->deleteCategory($category);

        return back()->with('success', 'Item category deleted successfully.');
    }
}
