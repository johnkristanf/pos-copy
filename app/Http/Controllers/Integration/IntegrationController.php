<?php

namespace App\Http\Controllers\Integration;

use App\Data\Items\StorePurchasedItemData;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Services\StockService;
use Symfony\Component\HttpFoundation\Response;

class IntegrationController extends Controller
{
    public function __construct(
        protected StockService $stockService
    ) {}

    public function storePurchasedItem(StorePurchasedItemData $data)
    {
        $purchase = $this->stockService->storePurchasedItem($data);

        return ApiResponse::Success('Store Purchased Items Successfully', Response::HTTP_CREATED, $purchase);
    }
}
