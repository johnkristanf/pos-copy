<?php

namespace App\Services;

use App\Data\Notifications\GetManyNotificationData;
use App\Data\Notifications\UpdateNotificationData;
use App\Events\NotificationModified;
use App\Http\Resources\Settings\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationService
{
    public function getManyNotifications(GetManyNotificationData $data): AnonymousResourceCollection
    {
        $notifications = Notification::query()
            ->when($data->search, fn ($q) => $q->where(fn ($sub) => $sub->where('actions', 'like', "%{$data->search}%")
            ))
            ->when($data->date_from, fn ($q) => $q->whereDate('created_at', '>=', $data->date_from))
            ->when($data->date_to, fn ($q) => $q->whereDate('created_at', '<=', $data->date_to))
            ->latest()
            ->paginate($data->per_page);

        return NotificationResource::collection($notifications);
    }

    public function updateNotification(Notification $notification, UpdateNotificationData $data): Notification
    {
        $payload = array_filter([
            'user_id' => $data->user_id,
            'actions' => $data->actions,
            'seen_by' => $data->seen_by,
            'seen_at' => $data->seen_at,
        ], fn ($value) => $value !== null);

        $notification->fill($payload)->save();

        return $notification->fresh();
    }

    public function notify(string $action, array $actions, ?string $entityType = null, ?string $entityName = null): void
    {
        $actor = auth()->user();

        $actorName = 'System';
        if ($actor) {
            $actorName = trim(($actor->first_name ?? '').' '.($actor->last_name ?? ''));
        }

        $message = $entityType && $entityName
        ? "{$actorName} {$action} {$entityType}: {$entityName}"
        : "{$actorName} {$action}";

        $actions[] = $message;

        $notification = Notification::create([
            'user_id' => $actor->id ?? 1,
            'actions' => $actions,
            'seen_by' => [],
        ]);

        NotificationModified::dispatch($notification, $action);
    }
}
