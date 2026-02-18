<?php

namespace App\Listeners;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Request;

class LogAuthenticationActivity
{
    public function handleLogin(Login $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        ActivityLog::create([
            'log_name' => 'authentication',
            'description' => "User logged in: {$event->user->name}",
            'subject_type' => $event->user->getMorphClass(),
            'subject_id' => $event->user->getKey(),
            'causer_type' => $event->user->getMorphClass(),
            'causer_id' => $event->user->getKey(),
            'properties' => [
                'ip' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ],
            'event' => 'login',
        ]);
    }

    public function handleLogout(Logout $event): void
    {
        if (! $event->user || ! $event->user instanceof User) {
            return;
        }

        ActivityLog::create([
            'log_name' => 'authentication',
            'description' => "User logged out: {$event->user->name}",
            'subject_type' => $event->user->getMorphClass(),
            'subject_id' => $event->user->getKey(),
            'causer_type' => $event->user->getMorphClass(),
            'causer_id' => $event->user->getKey(),
            'event' => 'logout',
        ]);
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @return array<class-string, string>
     */
    public function subscribe(): array
    {
        return [
            Login::class => 'handleLogin',
            Logout::class => 'handleLogout',
        ];
    }
}
