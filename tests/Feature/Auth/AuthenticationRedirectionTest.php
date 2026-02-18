<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated users accessing protected routes are redirected to login', function () {
    $response = $this->get('/dashboard');

    $response->assertStatus(302);
    $response->assertRedirect(route('login'));
});

test('unauthenticated users cannot access dashboard', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect(route('login'));
});
