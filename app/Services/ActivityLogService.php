<?php

namespace App\Services;

use App\Http\Helpers\Logging;
use App\Http\Resources\Settings\ActivityLogResource;
use App\Models\ActivityLog;
use Auth;
use DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Jenssegers\Agent\Agent;

class ActivityLogService
{
    public function log(
        string $logName,
        string $description,
        ?Model $causer = null,
        ?array $properties = null,
        ?string $event = null
    ): ActivityLog {
        $activityLog = ActivityLog::create([
            'log_name' => $logName,
            'description' => $description,
            'causer_type' => $causer?->getMorphClass(),
            'causer_id' => $causer?->getKey(),
            'properties' => $properties,
            'event' => $event,
        ]);

        return $activityLog;
    }

    public function getManyActivityLogs(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $search = trim($filters['search'] ?? '');

        $queryCallback = function (Builder $query) use ($filters) {
            $this->applyFilters($query, $filters);
        };

        if ($search) {
            return ActivityLog::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString()
                ->through(fn ($log) => (new ActivityLogResource($log))->resolve());
        }

        $query = ActivityLog::query();
        $queryCallback($query);

        return $query->paginate($perPage)
            ->withQueryString()
            ->through(fn ($log) => (new ActivityLogResource($log))->resolve());
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query->with(['causer:id,first_name,middle_name,last_name,email']);
        $query->when($filters['date_from'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filters['date_to'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($filters['log_name'] ?? null, fn ($q, $n) => $q->where('log_name', $n))
            ->when($filters['event'] ?? null, fn ($q, $e) => $q->where('event', $e))
            ->when($filters['device_type'] ?? null, fn ($q, $t) => $q->where('device_type', $t))
            ->when(isset($filters['causer_type'], $filters['causer_id']), function ($q) use ($filters) {
                $q->where('causer_type', $filters['causer_type'])
                    ->where('causer_id', $filters['causer_id']);
            });

        $this->applySorting($query, $filters);
    }

    protected function applySorting(Builder $query, array $filters): void
    {
        $sortBy = $filters['sortBy'] ?? 'created_at';
        $sortOrder = strtolower($filters['sortOrder'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $sortableColumns = ['id', 'log_name', 'description', 'event', 'device_type', 'ip_address', 'created_at', 'updated_at'];

        $query->when(\in_array($sortBy, $sortableColumns),
            fn ($q) => $q->orderBy($sortBy, $sortOrder),
            fn ($q) => $q->latest('created_at')
        );
    }

    public function getUniqueLogNames(): array
    {
        return ActivityLog::distinct()->pluck('log_name')->filter()->sort()->values()->toArray();
    }

    public function getUniqueEvents(): array
    {
        return ActivityLog::distinct()->pluck('event')->filter()->sort()->values()->toArray();
    }

    public function getUniqueDeviceTypes(): array
    {
        return ActivityLog::distinct()->pluck('device_type')->filter()->sort()->values()->toArray();
    }

    public function setDatabaseSessionVariables(): void
    {
        $agent = new Agent();

        DB::statement('
            SET
                @auth_user_id = ?,
                @request_ip = ?,
                @user_agent = ?,
                @device_type = ?,
                @browser = ?,
                @platform = ?,
                @device_info = ?
        ', [
            Auth::id(),
            request()->ip(),
            request()->userAgent(),
            Logging::detectDeviceType($agent),
            Logging::getBrowserInfo($agent),
            Logging::getPlatformInfo($agent),
            $agent->device() ?? 'Unknown',
        ]);
    }

    public function clearDatabaseSessionVariables(): void
    {
        DB::statement('SET @auth_user_id = NULL, @request_ip = NULL, @user_agent = NULL, @device_type = NULL, @browser = NULL, @platform = NULL, @device_info = NULL');
    }
}
