<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function __construct(
        protected SettingsService $settingsService
    ) {}

    /**
     * Get current system settings for display (any authenticated user)
     */
    public function index(): JsonResponse
    {
        $settings = $this->settingsService->getAllForDisplay();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }
}
