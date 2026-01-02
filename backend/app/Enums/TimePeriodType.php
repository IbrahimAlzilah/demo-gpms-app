<?php

namespace App\Enums;

enum TimePeriodType: string
{
    case PROPOSAL_SUBMISSION = 'proposal_submission';
    case PROPOSAL_REVIEW = 'proposal_review';
    case PROJECT_REGISTRATION = 'project_registration';
    case PROJECT_EXECUTION = 'project_execution';
    case DELIVERABLE_SUBMISSION = 'deliverable_submission';
    case SUPERVISOR_EVALUATION = 'supervisor_evaluation';
    case DISCUSSION_EVALUATION = 'discussion_evaluation';
    case GRADE_APPROVAL = 'grade_approval';

    public function label(): string
    {
        return match($this) {
            self::PROPOSAL_SUBMISSION => 'تقديم المقترحات',
            self::PROPOSAL_REVIEW => 'مراجعة المقترحات',
            self::PROJECT_REGISTRATION => 'التسجيل في المشاريع',
            self::PROJECT_EXECUTION => 'تنفيذ المشاريع',
            self::DELIVERABLE_SUBMISSION => 'تسليم المخرجات',
            self::SUPERVISOR_EVALUATION => 'تقييم المشرف',
            self::DISCUSSION_EVALUATION => 'تقييم لجنة المناقشة',
            self::GRADE_APPROVAL => 'اعتماد الدرجات',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PROPOSAL_SUBMISSION => 'فترة تقديم مقترحات المشاريع من الطلاب والمشرفين',
            self::PROPOSAL_REVIEW => 'فترة مراجعة المقترحات من قبل لجنة المشاريع',
            self::PROJECT_REGISTRATION => 'فترة تسجيل الطلاب في المشاريع المعتمدة',
            self::PROJECT_EXECUTION => 'فترة تنفيذ المشاريع ومتابعة التقدم',
            self::DELIVERABLE_SUBMISSION => 'فترة تسليم الوثائق والتقارير',
            self::SUPERVISOR_EVALUATION => 'فترة تقييم المشرفين للمشاريع',
            self::DISCUSSION_EVALUATION => 'فترة تقييم لجنة المناقشة',
            self::GRADE_APPROVAL => 'فترة اعتماد الدرجات النهائية',
        };
    }
}
