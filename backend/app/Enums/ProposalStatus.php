<?php

namespace App\Enums;

enum ProposalStatus: string
{
    case PENDING_REVIEW = 'pending_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case REQUIRES_MODIFICATION = 'requires_modification';

    public function label(): string
    {
        return match($this) {
            self::PENDING_REVIEW => 'قيد المراجعة',
            self::APPROVED => 'معتمد',
            self::REJECTED => 'مرفوض',
            self::REQUIRES_MODIFICATION => 'يتطلب تعديلات',
        };
    }

    public function canBeModified(): bool
    {
        return in_array($this, [self::PENDING_REVIEW, self::REQUIRES_MODIFICATION]);
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::APPROVED, self::REJECTED]);
    }
}
