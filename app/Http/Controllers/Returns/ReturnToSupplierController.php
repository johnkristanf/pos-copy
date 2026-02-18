<?php

namespace App\Http\Controllers\Returns;

use App\Data\Returns\ApproveRTSFormData;
use App\Data\Returns\CreateRTSFormData;
use App\Data\Returns\RejectRTSFormData;
use App\Data\Returns\SetRTSFormToCheckedData;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Models\ReturnsToSupplier;
use App\Models\Suppliers;
use App\Services\ItemsService;
use App\Services\ReturnService;
use App\Services\StockService;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ReturnToSupplierController extends Controller
{
    public function __construct(
        protected StockService $stockService,
        protected ItemsService $itemsService,
        protected ReturnService $returnService,
        protected SupplierService $supplierService,
    ) {}

    public function renderReturnToSupplierPage(Request $request)
    {
        $status = $request->query('status') ?? config('statuses.returns_to_supplier.pending');

        $returns = $this->returnService->getManyReturnToSuppliers(['status' => $status]);
        $suppliers = Suppliers::with('items')->get();

        return Inertia::render('return/to-supplier', ['returns' => $returns, 'suppliers' => $suppliers]);
    }

    public function createRTSForm(CreateRTSFormData $data)
    {
        $this->returnService->createReturnToSupplier($data);

        return back()->with('success', 'Return to supplier form created successfully');
    }

    public function setRTSFormToChecked(ReturnsToSupplier $id)
    {
        $data = new SetRTSFormToCheckedData($id->id);

        $this->returnService->setRTSFormToChecked($data);

        return back()->with('success', 'Return status set to for approval');
    }

    public function approveRTSForm(ReturnsToSupplier $id)
    {
        $data = new ApproveRTSFormData($id->id);
        $this->returnService->approveRTSForm($data);

        return back()->with('success', 'Return approved successfully');
    }

    public function rejectRTSForm(ReturnsToSupplier $id)
    {
        $data = new RejectRTSFormData($id->id);
        $this->returnService->rejectRTSForm($data);

        return back()->with('success', 'Return rejected successfully');
    }

    public function searchSuppliers(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->get('query'),
            'search_by' => 'general',
        ];

        return response()->json(
            $this->supplierService->getManySuppliers($filters, 10)
        );
    }

    public function getItemsUnderSupplier($supplierID)
    {
        $items = $this->returnService->getItemsUnderSupplier($supplierID);

        return ApiResponse::Success('Fetched purchases and stocks with their items for supplier', Response::HTTP_OK, $items);
    }
}
