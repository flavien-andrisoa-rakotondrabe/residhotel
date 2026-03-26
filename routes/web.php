<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\Session;
use App\Http\Controllers\AuthController;

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

Route::get('/search', [SearchController::class, 'index'])
    ->name('search');

Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])
    ->name('favorites.toggle');

require __DIR__.'/settings.php';
