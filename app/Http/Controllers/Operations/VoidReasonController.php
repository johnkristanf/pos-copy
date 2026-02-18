<?php

namespace App\Http\Controllers\Operations;

use App\Data\Operations\CreateVoidReasonData;
use App\Data\Operations\DeleteVoidReasonData;
use App\Data\Operations\UpdateVoidReasonData;
use App\Http\Controllers\Controller;
use App\Models\VoidReason;
use App\Services\VoidReasonService;
use Inertia\Inertia;

class VoidReasonController extends Controller
{
    public function __construct(
        protected VoidReasonService $voidReasonService,
    ) {}

    public function renderVoidReasonsPage()
    {
        $filters = [
            'search' => request()->get('search'),
            'date_from' => request()->get('date_from'),
            'date_to' => request()->get('date_to'),
        ];

        $perPage = request()->get('per_page', 10);

        $voidReasons = $this->voidReasonService->getManyVoidReasons($filters, (int) $perPage);

        if (request()->wantsJson()) {
            return response()->json([
                'voidReasons' => $voidReasons,
                'roles' => $this->voidReasonService->getAllRoles(),
            ]);
        }

        return Inertia::render('operations/void', [
            'voidReasons' => $voidReasons,
            'roles' => $this->voidReasonService->getAllRoles(),
            'filters' => $filters,
        ]);
    }

    public function createVoidReason(CreateVoidReasonData $data)
    {
        $this->voidReasonService->createVoidReason($data);

        return back()->with('success', 'Void reason created successfully.');
    }

    public function updateVoidReason(UpdateVoidReasonData $data, VoidReason $voidReason)
    {
        $this->voidReasonService->updateVoidReason($voidReason, $data);

        return back()->with('success', 'Void reason updated successfully.');
    }

    public function deleteVoidReason(VoidReason $voidReason)
    {
        $data = new DeleteVoidReasonData($voidReason->id);

        $this->voidReasonService->deleteVoidReason($data);

        return back()->with('success', 'Void reason deleted successfully.');
    }
}
