<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('dashboard.renderDashboardPage'))->middleware('auth')->name('home');

Route::get('/csrf-token', fn () => response()->json(['token' => csrf_token()]));

Route::fallback(fn () => Inertia::render('error', [
    'status' => 404,
    'title' => 'Page Not Found',
    'description' => 'The page you\'re looking for doesn\'t exist or has been moved.',
    'isDev' => config('app.debug'),
    'error' => null,
])->toResponse(request())->setStatusCode(404));
