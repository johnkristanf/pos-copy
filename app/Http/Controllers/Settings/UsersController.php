<?php

namespace App\Http\Controllers\Settings;

use App\Data\Users\CreateUserData;
use App\Data\Users\DeleteUserData;
use App\Data\Users\UpdateUserData;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UsersService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function __construct(
        protected UsersService $usersService,
    ) {}

    public function renderMePage(): Response
    {
        return Inertia::render('settings/users/me', [
            'user' => Auth::user(),
        ]);
    }

    public function renderUserPage(User $user): Response
    {
        return Inertia::render('settings/users/user', [
            'user' => $this->usersService->getUserById((int) $user->id),
            'stock_locations' => Inertia::defer($this->usersService->getStockLocations(...)),
            'roles' => Inertia::defer($this->usersService->getRoles(...)),
            'features' => Inertia::defer($this->usersService->getFeatures(...)),
            'permissions' => Inertia::defer($this->usersService->getPermissions(...)),
        ]);
    }

    public function renderUsersPage(): Response
    {
        $filters = request()->only([
            'search', 'search_by', 'date_from', 'date_to', 'stock_location_id', 'role_id',
        ]);

        $perPage = request()->integer('limit', 10);

        return Inertia::render('settings/users', [
            'users' => Inertia::defer(fn () => $this->usersService->getManyUsers($filters, $perPage)
            ),
            'stock_locations' => Inertia::defer($this->usersService->getStockLocations(...)),
            'roles' => Inertia::defer($this->usersService->getRoles(...)),
            'features' => Inertia::defer($this->usersService->getFeatures(...)),
            'permissions' => Inertia::defer($this->usersService->getPermissions(...)),
            'filters' => $filters,
        ]);
    }

    public function registerUser(CreateUserData $data): RedirectResponse
    {
        $this->usersService->createUser($data);

        return back()->with('success', 'User created successfully.');
    }

    public function updateUser(User $user, UpdateUserData $data): RedirectResponse
    {
        $this->usersService->updateUser($user, $data);

        return back()->with('success', 'User updated successfully.');
    }

    public function deleteUser(User $user): RedirectResponse
    {
        $data = new DeleteUserData($user);

        $this->usersService->deleteUser($data);

        return back()->with('success', 'User deleted successfully.');
    }
}
