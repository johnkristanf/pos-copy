<?php

namespace App\Http\Controllers\Notifications;

use App\Data\Notifications\GetManyNotificationData;
use App\Data\Notifications\UpdateNotificationData;
use App\Http\Controllers\Controller;
use App\Http\Helpers\ApiResponse;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getManyNotifications(GetManyNotificationData $data): JsonResponse
    {
        $notifications = $this->notificationService->getManyNotifications($data);

        return ApiResponse::Success('Notifications retrieved successfully', 200, $notifications);
    }

    public function updateNotification(Notification $notification, UpdateNotificationData $data): JsonResponse
    {
        $updatedNotification = $this->notificationService->updateNotification($notification, $data);

        return ApiResponse::Success('Notification updated successfully', 200, $updatedNotification);
    }
}
