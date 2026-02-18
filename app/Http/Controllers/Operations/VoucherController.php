<?php

namespace App\Http\Controllers\Operations;

use App\Data\Operations\ApplyVoucherData;
use App\Data\Operations\CreateVoucherData;
use App\Data\Operations\DeleteVoucherData;
use App\Data\Operations\UpdateVoucherData;
use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Services\VoucherService;
use Inertia\Inertia;

class VoucherController extends Controller
{
    public function __construct(
        protected VoucherService $voucherService,
    ) {}

    public function renderVoucherPage()
    {
        $filters = [
            'search' => request()->get('search'),
            'date_from' => request()->get('date_from'),
            'date_to' => request()->get('date_to'),
        ];

        $perPage = request()->get('per_page', 10);

        $vouchers = $this->voucherService->getManyVouchers($filters, (int) $perPage);

        return Inertia::render('operations/vouchers', [
            'vouchers' => $vouchers,
            'filters' => $filters,
        ]);
    }

    public function createVoucher(CreateVoucherData $data)
    {
        $this->voucherService->createVoucher($data);

        return back()->with('success', 'Voucher created successfully.');
    }

    public function updateVoucher(UpdateVoucherData $data, Voucher $voucher)
    {
        $this->voucherService->updateVoucher($voucher, $data);

        return back()->with('success', 'Voucher updated successfully.');
    }

    public function deleteVoucher(Voucher $voucher)
    {
        $data = new DeleteVoucherData($voucher->id);

        $this->voucherService->deleteVoucher($data);

        return back()->with('success', 'Voucher deleted successfully.');
    }

    public function applyVoucher(ApplyVoucherData $data)
    {
        $result = $this->voucherService->applyVoucher($data);

        return response()->json($result);
    }
}
