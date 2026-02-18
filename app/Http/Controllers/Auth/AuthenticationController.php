<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticationController extends Controller implements HasMiddleware
{
    public function __construct(
        private readonly ActivityLogService $activityLogService
    ) {}

    public function renderLoginPage(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function renderForgotPasswordPage(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function renderResetPasswordPage(Request $request): Response
    {
        return Inertia::render('auth/reset-password', [
            'email' => $request->input('email'),
            'token' => $request->route('token'),
        ]);
    }

    public static function middleware(): array
    {
        return Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')
        ? [new Middleware('password.confirm', only : ['show'])]
        : [];
    }

    public function loginUser(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $user = Auth::user();

        if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
            Auth::logout();
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $remember,
            ]);

            return to_route('two-factor.login');
        }

        $request->session()->regenerate();

        return $this->redirectUserBasedOnRole($user);
    }

    protected function redirectUserBasedOnRole(User $user): RedirectResponse
    {
        if (! $user->relationLoaded('roles')) {
            $user->load('roles:id,code');
        }

        $userRoles = $user->roles->pluck('code')->toArray();

        $routeMap = [
            config('roles.sales_officer.code') => 'dashboard.renderDashboardPage',
            config('roles.cashier.code') => 'dashboard.renderDashboardPage',
            config('roles.inventory_officer.code') => 'dashboard.renderDashboardPage',
            config('roles.merchandiser.code') => 'dashboard.renderDashboardPage',
            config('roles.administrator.code') => 'dashboard.renderDashboardPage',
            config('roles.supervisor.code') => 'dashboard.renderDashboardPage',
        ];

        foreach ($routeMap as $roleCode => $routeName) {
            if (\in_array($roleCode, $userRoles)) {
                return to_route($routeName);
            }
        }

        return to_route('dashboard.renderDashboardPage');
    }

    public function logoutUser(Request $request): RedirectResponse
    {

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login');
    }

    public function sendResetPasswordByEmail(ForgotPasswordRequest $request): RedirectResponse
    {
        Password::sendResetLink(
            $request->validated()
        );

        return back()->with('status', 'A reset link will be sent if the account exists.');
    }

    public function resetUserPassword(ResetPasswordRequest $request): RedirectResponse
    {
        $status = Password::reset(
            $request->validated(),
            function (User $user) use ($request) {
                $user->forceFill([
                    'password' => $request->password,
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return to_route('login')->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function updateUserPassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->validated()['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }
}
