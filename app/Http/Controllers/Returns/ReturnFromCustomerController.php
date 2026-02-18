<?php

namespace App\Http\Controllers\Returns;

use App\Data\Returns\ApprovedRFCFormData;
use App\Data\Returns\CreateRFCFormData;
use App\Data\Returns\RejectRFCFormData;
use App\Data\Returns\SetRFCFormToCheckedData;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Services\ItemsService;
use App\Services\OrdersService;
use App\Services\ReturnService;
use App\Services\StockLocationService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ReturnFromCustomerController extends Controller
{
    public function __construct(
        protected StockService $stockService,
        protected OrdersService $ordersService,
        protected ItemsService $itemsService,
        protected StockLocationService $stockLocationService,
        protected ReturnService $returnsService,
    ) {}

    public function renderReturnFromCustomerPage(Request $request)
    {
        $filters = $request->only([
            'search', 'search_by', 'category_id', 'location_id', 'status', 'sort_by', 'sort_order',
        ]);

        $perPage = $request->integer('per_page', 10);

        return Inertia::render('return/from-customer', [
            'returns' => $this->returnsService->getManyReturnsFromCustomer($filters, $perPage),
            'stock_location' => $this->stockLocationService->getAllStockLocations(['id', 'name']),
            'filters' => $filters,
        ]);
    }

    public function createRFCForm(CreateRFCFormData $data)
    {
        $this->returnsService->createReturnFromCustomer($data);

        return back()->with('success', 'Return from customer created successfully.');
    }

    public function setRFCFormToChecked(Request $request)
    {
        $data = SetRFCFormToCheckedData::fromRequest($request);
        $this->returnsService->setRFCFormToChecked($data);

        return back()->with('success', 'Return from customer set status to checked.');
    }

    public function approveRFCForm(Request $request)
    {
        $data = ApprovedRFCFormData::fromRequest($request);
        $this->returnsService->approveRFCForm($data);

        return back()->with('success', 'Return from customer set status to approved.');
    }

    public function rejectRFCForm(Request $request)
    {
        $data = RejectRFCFormData::fromRequest($request);
        $this->returnsService->rejectRFCForm($data);

        return back()->with('success', 'Return from customer set status to rejected.');
    }

    public function getItemsOrderedByCustomer($customerID)
    {
        $items = $this->ordersService->getAllItemsOrderedByCustomer($customerID);

        return ApiResponse::Success('Fetched item ordered by customer', Response::HTTP_OK, $items);
    }

    public function getInvoiceNumberByCustomer($customerID)
    {
        $invoiceNumbers = $this->ordersService->getAllInvoiceNumbersByCustomer($customerID);

        return ApiResponse::Success('Fetched invoice numbers by customer', Response::HTTP_OK, $invoiceNumbers);

    }
}
