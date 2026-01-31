<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemSettingsController extends Controller
{
    public function __construct(
        protected SettingsService $settingsService
    ) {}

    /**
     * List all system settings with definitions (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $settings = $this->settingsService->getAllWithDefinitions();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update one or more settings (admin only)
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable',
        ]);

        $keys = array_keys(SettingsService::DEFINITIONS);
        $input = $request->input('settings', []);
        $toUpdate = [];
        foreach ($keys as $key) {
            if (array_key_exists($key, $input)) {
                $toUpdate[$key] = $input[$key];
            }
        }

        $this->settingsService->bulkUpdate($toUpdate);

        return response()->json([
            'success' => true,
            'data' => $this->settingsService->getAllForDisplay(),
            'message' => 'Settings updated successfully',
        ]);
    }
}
