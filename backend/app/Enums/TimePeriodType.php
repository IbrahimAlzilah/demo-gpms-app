<?php

namespace App\Enums;

enum TimePeriodType: string
{
    case PROPOSAL_SUBMISSION = 'proposal_submission';
    case PROJECT_REGISTRATION = 'project_registration';
    case CHAPTER_SUBMISSION_PHASE_1 = 'chapter_submission_phase_1';
    case FINAL_DEFENSE_PHASE_1 = 'final_defense_phase_1';
    case CHAPTER_SUBMISSION_PHASE_2 = 'chapter_submission_phase_2';
    case FINAL_DEFENSE_PHASE_2 = 'final_defense_phase_2';
    case FINAL_PROJECT_DOCUMENT_SUBMISSION = 'final_project_document_submission';
    case GRADE_APPROVAL = 'grade_approval';
    case GENERAL = 'general';

    public function label(): string
    {
        return match($this) {
            self::PROPOSAL_SUBMISSION => 'تقديم المقترحات',
            self::PROJECT_REGISTRATION => 'التسجيل في المشاريع',
            self::CHAPTER_SUBMISSION_PHASE_1 => 'تسليم الفصول - المرحلة الأولى',
            self::FINAL_DEFENSE_PHASE_1 => 'المناقشة النهائية - المرحلة الأولى',
            self::CHAPTER_SUBMISSION_PHASE_2 => 'تسليم الفصول - المرحلة الثانية',
            self::FINAL_DEFENSE_PHASE_2 => 'المناقشة النهائية - المرحلة الثانية',
            self::FINAL_PROJECT_DOCUMENT_SUBMISSION => 'تسليم وثائق المشروع النهائية',
            self::GRADE_APPROVAL => 'اعتماد الدرجات',
            self::GENERAL => 'عام',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PROPOSAL_SUBMISSION => 'فترة تقديم مقترحات المشاريع من الطلاب والمشرفين',
            self::PROJECT_REGISTRATION => 'فترة تسجيل الطلاب في المشاريع المعتمدة',
            self::CHAPTER_SUBMISSION_PHASE_1 => 'فترة تسليم الفصول - المرحلة الأولى',
            self::FINAL_DEFENSE_PHASE_1 => 'فترة المناقشة النهائية - المرحلة الأولى',
            self::CHAPTER_SUBMISSION_PHASE_2 => 'فترة تسليم الفصول - المرحلة الثانية',
            self::FINAL_DEFENSE_PHASE_2 => 'فترة المناقشة النهائية - المرحلة الثانية',
            self::FINAL_PROJECT_DOCUMENT_SUBMISSION => 'فترة تسليم وثائق المشروع النهائية',
            self::GRADE_APPROVAL => 'فترة اعتماد الدرجات النهائية',
            self::GENERAL => 'فترة عامة - تسمح بتمكين جميع الفترات السابقة',
        };
    }

    /**
     * Get all valid type values as array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
