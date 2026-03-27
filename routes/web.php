<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\Session;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\PropertyController;

Route::inertia('/', 'landing', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('landing');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('language/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'fr'])) {
        Session::put('locale', $locale);
    }
    return redirect()->back();
})->name('lang');

Route::get('/auth', [AuthController::class, 'showAuth'])->name('auth');
Route::get('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
Route::get('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');

Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');

Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');

Route::get('/search', [SearchController::class, 'index'])
    ->name('search');

Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])
    ->name('favorites.toggle');

require __DIR__.'/settings.php';
