<?php

namespace App\Enums;

enum TimePeriodType: string
{
    case PROPOSAL_SUBMISSION = 'proposal_submission';
    case PROPOSAL_REVIEW = 'proposal_review';
    case PROJECT_REGISTRATION = 'project_registration';
    case PROJECT_EXECUTION = 'project_execution';
    case DOCUMENT_SUBMISSION = 'document_submission';
    case DELIVERABLE_SUBMISSION = 'deliverable_submission';
    case SUPERVISOR_EVALUATION = 'supervisor_evaluation';
    case COMMITTEE_EVALUATION = 'committee_evaluation';
    case DISCUSSION_EVALUATION = 'discussion_evaluation';
    case DISCUSSION_EVALUATION_1 = 'discussion_evaluation_1';
    case DISCUSSION_EVALUATION_2 = 'discussion_evaluation_2';
    case FINAL_DISCUSSION = 'final_discussion';
    case GRADE_APPROVAL = 'grade_approval';
    case GENERAL = 'general';

    public function label(): string
    {
        return match($this) {
            self::PROPOSAL_SUBMISSION => 'تقديم المقترحات',
            self::PROPOSAL_REVIEW => 'مراجعة المقترحات',
            self::PROJECT_REGISTRATION => 'التسجيل في المشاريع',
            self::PROJECT_EXECUTION => 'تنفيذ المشاريع',
            self::DOCUMENT_SUBMISSION => 'تسليم الوثائق',
            self::DELIVERABLE_SUBMISSION => 'تسليم المخرجات',
            self::SUPERVISOR_EVALUATION => 'تقييم المشرف',
            self::COMMITTEE_EVALUATION => 'تقييم اللجنة',
            self::DISCUSSION_EVALUATION => 'تقييم لجنة المناقشة',
            self::DISCUSSION_EVALUATION_1 => 'تقييم لجنة المناقشة - المرحلة الأولى',
            self::DISCUSSION_EVALUATION_2 => 'تقييم لجنة المناقشة - المرحلة الثانية',
            self::FINAL_DISCUSSION => 'المناقشة النهائية',
            self::GRADE_APPROVAL => 'اعتماد الدرجات',
            self::GENERAL => 'عام',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PROPOSAL_SUBMISSION => 'فترة تقديم مقترحات المشاريع من الطلاب والمشرفين',
            self::PROPOSAL_REVIEW => 'فترة مراجعة المقترحات من قبل لجنة المشاريع',
            self::PROJECT_REGISTRATION => 'فترة تسجيل الطلاب في المشاريع المعتمدة',
            self::PROJECT_EXECUTION => 'فترة تنفيذ المشاريع',
            self::DOCUMENT_SUBMISSION => 'فترة تسليم الوثائق والتقارير',
            self::DELIVERABLE_SUBMISSION => 'فترة تسليم المخرجات المطلوبة',
            self::SUPERVISOR_EVALUATION => 'فترة تقييم المشرفين للمشاريع',
            self::COMMITTEE_EVALUATION => 'فترة تقييم لجنة المشاريع',
            self::DISCUSSION_EVALUATION => 'فترة تقييم لجنة المناقشة',
            self::DISCUSSION_EVALUATION_1 => 'فترة تقييم لجنة المناقشة - المرحلة الأولى',
            self::DISCUSSION_EVALUATION_2 => 'فترة تقييم لجنة المناقشة - المرحلة الثانية',
            self::FINAL_DISCUSSION => 'فترة المناقشة النهائية للمشاريع',
            self::GRADE_APPROVAL => 'فترة اعتماد الدرجات النهائية',
            self::GENERAL => 'فترة عامة',
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
