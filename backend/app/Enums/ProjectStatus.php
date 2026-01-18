<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case DRAFT = 'draft';
    case ANNOUNCED = 'announced';
    case AVAILABLE_FOR_REGISTRATION = 'available_for_registration';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'مسودة',
            self::ANNOUNCED => 'معلن',
            self::AVAILABLE_FOR_REGISTRATION => 'متاح للتسجيل',
            self::IN_PROGRESS => 'قيد التنفيذ',
            self::COMPLETED => 'مكتمل',
            self::ARCHIVED => 'مؤرشف',
        };
    }

    public function isVisibleToStudents(): bool
    {
        return in_array($this, [
            self::ANNOUNCED,
            self::AVAILABLE_FOR_REGISTRATION,
            self::IN_PROGRESS,
            self::COMPLETED,
        ]);
    }

    public function canRegister(): bool
    {
        return $this === self::AVAILABLE_FOR_REGISTRATION;
    }

    public function isActive(): bool
    {
        return in_array($this, [
            self::AVAILABLE_FOR_REGISTRATION,
            self::IN_PROGRESS,
        ]);
    }
}
