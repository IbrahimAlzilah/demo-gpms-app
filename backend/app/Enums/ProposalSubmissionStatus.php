<?php

namespace App\Enums;

enum ProposalSubmissionStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case REQUIRES_MODIFICATION = 'requires_modification';

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'مسودة',
            self::SUBMITTED => 'تم التقديم',
            self::UNDER_REVIEW => 'قيد المراجعة',
            self::APPROVED => 'معتمد',
            self::REJECTED => 'مرفوض',
            self::REQUIRES_MODIFICATION => 'يتطلب تعديلات',
        };
    }

    public function canBeModified(): bool
    {
        return in_array($this, [self::DRAFT, self::REQUIRES_MODIFICATION]);
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::APPROVED, self::REJECTED]);
    }

    public function allowsNewProposals(): bool
    {
        // Allow adding new proposals when editing: draft, submitted, under_review, or requires_modification
        // Only block when approved or rejected (final states)
        return in_array($this, [
            self::DRAFT,
            self::SUBMITTED,
            self::UNDER_REVIEW,
            self::REQUIRES_MODIFICATION,
        ]);
    }
}
