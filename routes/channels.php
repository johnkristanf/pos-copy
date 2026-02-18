<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', fn ($user, $id) => (int) $user->id === (int) $id);
Broadcast::channel('notifications.role.{roleId}', fn (User $user, $roleId) => $user->roles->contains('id', $roleId));
