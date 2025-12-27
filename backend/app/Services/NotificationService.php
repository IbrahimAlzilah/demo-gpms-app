<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create a notification
     */
    public function create(
        User $user,
        string $message,
        ?string $type = null,
        ?string $relatedEntityType = null,
        ?int $relatedEntityId = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'message' => $message,
            'type' => $type,
            'related_entity_type' => $relatedEntityType,
            'related_entity_id' => $relatedEntityId,
            'is_read' => false,
        ]);
    }

    /**
     * Create notifications for multiple users
     */
    public function createForUsers(
        array $userIds,
        string $message,
        ?string $type = null,
        ?string $relatedEntityType = null,
        ?int $relatedEntityId = null
    ): void {
        $notifications = [];
        foreach ($userIds as $userId) {
            $notifications[] = [
                'user_id' => $userId,
                'message' => $message,
                'type' => $type,
                'related_entity_type' => $relatedEntityType,
                'related_entity_id' => $relatedEntityId,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Notification::insert($notifications);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification): Notification
    {
        $notification->markAsRead();
        return $notification->fresh();
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }
}

