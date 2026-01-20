<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    /**
     * Get group minimum members setting
     */
    public function getGroupMinMembers(): int
    {
        return Setting::get('group_min_members', 2);
    }

    /**
     * Get group maximum members setting
     */
    public function getGroupMaxMembers(): int
    {
        return Setting::get('group_max_members', 5);
    }

    /**
     * Set group minimum members setting
     */
    public function setGroupMinMembers(int $value): void
    {
        Setting::set('group_min_members', $value, 'integer', 'Minimum number of members required in a student group');
    }

    /**
     * Set group maximum members setting
     */
    public function setGroupMaxMembers(int $value): void
    {
        Setting::set('group_max_members', $value, 'integer', 'Maximum number of members allowed in a student group');
    }

    /**
     * Get any setting by key
     */
    public function get(string $key, $default = null)
    {
        return Setting::get($key, $default);
    }

    /**
     * Set any setting by key
     */
    public function set(string $key, $value, string $type = 'string', ?string $description = null): void
    {
        Setting::set($key, $value, $type, $description);
    }
}
