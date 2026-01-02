<?php

namespace App\Enums;

enum RequestStatus: string
{
    case PENDING = 'pending';
    case SUPERVISOR_APPROVED = 'supervisor_approved';
    case SUPERVISOR_REJECTED = 'supervisor_rejected';
    case COMMITTEE_APPROVED = 'committee_approved';
    case COMMITTEE_REJECTED = 'committee_rejected';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'قيد الانتظار',
            self::SUPERVISOR_APPROVED => 'موافقة المشرف',
            self::SUPERVISOR_REJECTED => 'رفض المشرف',
            self::COMMITTEE_APPROVED => 'موافقة اللجنة',
            self::COMMITTEE_REJECTED => 'رفض اللجنة',
            self::CANCELLED => 'ملغي',
        };
    }

    public function isPending(): bool
    {
        return in_array($this, [self::PENDING, self::SUPERVISOR_APPROVED]);
    }

    public function isFinal(): bool
    {
        return in_array($this, [
            self::COMMITTEE_APPROVED,
            self::COMMITTEE_REJECTED,
            self::CANCELLED,
        ]);
    }

    public function canBeCancelled(): bool
    {
        return $this === self::PENDING;
    }
}
