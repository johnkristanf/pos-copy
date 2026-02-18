<?php

namespace App\Http\Controllers\Menu;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function renderDashboardPage(Request $request): Response
    {
        $user = Auth::user();
        $user->loadMissing('roles');
        $data = [];
        $year = $request->input('year', now()->year);

        if ($user->roles->contains('name', config('roles.sales_officer.name'))) {
            $data = $this->dashboardService->getSalesOfficerDashboardData($user);
        } elseif ($user->roles->contains('name', config('roles.cashier.name'))) {
            $data = $this->dashboardService->getCashierDashboardData($user);
        } elseif ($user->roles->contains('name', config('roles.inventory_manager.name'))) {
            $data = $this->dashboardService->getInventoryManagerDashboardData($user, (int) $year);
        } elseif ($user->roles->contains('name', config('roles.inventory_officer.name'))) {
            $data = $this->dashboardService->getInventoryOfficerDashboardData($user);
        } elseif ($user->roles->contains('name', config('roles.merchandiser.name'))) {
            $data = $this->dashboardService->getMerchandiserDashboardData((int) $year);
        } elseif ($user->roles->contains('name', config('roles.administrator.name'))) {
            $data = $this->dashboardService->getAdministratorDashboardData();
        } elseif ($user->roles->contains('name', config('roles.purchase_sales_head.name'))) {
            $data = $this->dashboardService->getPurchasingSalesHeadDashboardData((int) $year);
        } elseif ($user->roles->contains('name', config('roles.supervisor.name'))) {
            $data = $this->dashboardService->getSupervisorDashboardData((int) $year);
        } elseif ($user->roles->contains('name', config('roles.evp.name')) || $user->roles->contains('name', config('roles.super_admin.name'))) {
            $data = $this->dashboardService->getEVPDashboardData((int) $year);
        }

        return Inertia::render('dashboard', $data);
    }

    public function lookupItem(Request $request)
    {
        $query = $request->input('query');

        if (! $query || \strlen($query) < 2) {
            return response()->json([]);
        }

        $results = $this->dashboardService->lookupItems($query);

        return response()->json($results);
    }
}
