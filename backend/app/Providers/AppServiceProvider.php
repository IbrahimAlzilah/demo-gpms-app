<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for MySQL key length issue with utf8mb4
        Schema::defaultStringLength(191);

        // Explicit route model binding for clarity
        \Illuminate\Support\Facades\Route::bind('registration', function ($value) {
            return \App\Models\ProjectRegistration::findOrFail($value);
        });

        \Illuminate\Support\Facades\Route::bind('invitation', function ($value) {
            return \App\Models\GroupInvitation::findOrFail($value);
        });

        \Illuminate\Support\Facades\Route::bind('request', function ($value) {
            return \App\Models\ProjectRequest::findOrFail($value);
        });
    }
}
