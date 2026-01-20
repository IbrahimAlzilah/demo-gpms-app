<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'group_min_members',
                'value' => '2',
                'type' => 'integer',
                'description' => 'Minimum number of members required in a student group',
            ],
            [
                'key' => 'group_max_members',
                'value' => '5',
                'type' => 'integer',
                'description' => 'Maximum number of members allowed in a student group',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
