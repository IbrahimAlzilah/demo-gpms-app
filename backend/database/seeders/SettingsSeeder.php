<?php

namespace Database\Seeders;

use App\Services\SettingsService;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $service = app(SettingsService::class);

        foreach (SettingsService::DEFINITIONS as $key => $def) {
            \App\Models\Setting::set(
                $key,
                $def['default'],
                $def['type'],
                $def['description']
            );
        }
    }
}
