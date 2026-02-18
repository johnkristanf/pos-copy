<?php

namespace App\Http\Controllers\Items;

use App\Data\Suppliers\CreateSupplierData;
use App\Data\Suppliers\UpdateSupplierData;
use App\Http\Controllers\Controller;
use App\Models\Suppliers;
use App\Services\SupplierService;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct(
        protected SupplierService $supplierService,
    ) {}

    public function renderSupplierPage(): Response
    {
        $filters = [
            'search' => request()->get('search'),
            'search_by' => request()->get('search_by', 'name'),
            'date_from' => request()->get('date_from'),
            'date_to' => request()->get('date_to'),
            'status' => request()->get('status'),
        ];

        $perPage = request()->get('per_page', 10);

        return Inertia::render('items/supplier', [
            'suppliers' => $this->supplierService->getManySuppliers($filters, (int) $perPage),
        ]);
    }

    public function createSupplier(CreateSupplierData $data)
    {
        $this->supplierService->createSupplier($data);

        return back()->with('success', 'Supplier created successfully.');
    }

    public function updateSupplier(UpdateSupplierData $data, Suppliers $suppliers)
    {
        $this->supplierService->updateSupplier($suppliers, $data);

        return back()->with('success', 'Supplier updated successfully.');
    }

    public function deleteSupplier(Suppliers $suppliers)
    {
        $this->supplierService->deleteSupplier($suppliers);

        return back()->with('success', 'Supplier deleted successfully.');
    }
}
