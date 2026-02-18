<?php

namespace App\Http\Middleware;

use App\Models\Permissions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleBasedAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $featureTag, string $permissionSlug): Response
    {
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            return redirect()->route('login');
        }

        $permission = Permissions::query()->where('slug', $permissionSlug)->first();

        if (! $permission) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden: Invalid Permission'], 403);
            }
            abort(403, 'Security configuration error: Permission not found.');
        }

        $featureTags = explode('|', $featureTag);

        $hasAccess = $user->roles()
            ->whereHas('app_features', function ($query) use ($featureTags, $permission) {
                $query->whereIn('tag', $featureTags)
                    ->where('role_feature_permissions.permission_id', $permission->id);
            })
            ->exists();

        if (! $hasAccess && $user->roles()->where('code', 999)->exists()) {
            $hasAccess = true;
        }

        if (! $hasAccess) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You are not authorized to access this resource.',
                ], 403);
            }

            abort(403, 'You are not authorized to access this page.');
        }

        return $next($request);
    }
}
