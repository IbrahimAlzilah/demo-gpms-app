<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register custom middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'window' => \App\Http\Middleware\CheckTimeWindow::class,
        ]);

        // Enable API middleware group (includes throttle, CORS, etc.)
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withSchedule(function ($schedule): void {
        // Schedule deadline reminders to run daily at 9:00 AM
        $schedule->command('notifications:send-deadline-reminders')
            ->dailyAt('09:00')
            ->timezone('Asia/Riyadh')
            ->withoutOverlapping();

        // Schedule period activation check to run daily at 8:00 AM
        // This will activate periods when their start date is reached
        $schedule->command('periods:activate')
            ->dailyAt('08:00')
            ->timezone('Asia/Riyadh')
            ->withoutOverlapping();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
