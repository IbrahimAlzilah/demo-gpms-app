<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    /** Default keys and metadata for admin UI and validation */
    public const DEFINITIONS = [
        // ========== GROUPS ==========
        'group_min_members' => [
            'type' => 'integer',
            'default' => 2,
            'description' => 'Minimum number of members required in a student group',
            'category' => 'groups',
            'min' => 1,
            'max' => 20,
        ],
        'group_max_members' => [
            'type' => 'integer',
            'default' => 5,
            'description' => 'Maximum number of members allowed in a student group',
            'category' => 'groups',
            'min' => 1,
            'max' => 20,
        ],
        'group_name_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for group name (characters)',
            'category' => 'groups',
            'min' => 10,
            'max' => 500,
        ],
        'group_join_request_message_max_length' => [
            'type' => 'integer',
            'default' => 500,
            'description' => 'Maximum length for group join request message (characters)',
            'category' => 'groups',
            'min' => 100,
            'max' => 2000,
        ],

        // ========== PROPOSALS ==========
        'max_proposals_per_group_submission' => [
            'type' => 'integer',
            'default' => 5,
            'description' => 'Maximum number of proposals a student group can submit in one submission',
            'category' => 'proposals',
            'min' => 1,
            'max' => 20,
        ],
        'proposal_title_min_length' => [
            'type' => 'integer',
            'default' => 5,
            'description' => 'Minimum length for proposal title (characters)',
            'category' => 'proposals',
            'min' => 3,
            'max' => 50,
        ],
        'proposal_title_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for proposal title (characters)',
            'category' => 'proposals',
            'min' => 50,
            'max' => 500,
        ],
        'proposal_description_min_length' => [
            'type' => 'integer',
            'default' => 50,
            'description' => 'Minimum length for proposal description (characters)',
            'category' => 'proposals',
            'min' => 10,
            'max' => 200,
        ],

        // ========== PROJECTS ==========
        'max_projects_per_group' => [
            'type' => 'integer',
            'default' => 1,
            'description' => 'Maximum number of projects a student group can register for or have approved',
            'category' => 'projects',
            'min' => 1,
            'max' => 10,
        ],
        'project_default_max_students' => [
            'type' => 'integer',
            'default' => 4,
            'description' => 'Default maximum students per project when creating from proposal',
            'category' => 'projects',
            'min' => 1,
            'max' => 20,
        ],
        'project_max_students_limit' => [
            'type' => 'integer',
            'default' => 10,
            'description' => 'Maximum allowed value for max_students per project',
            'category' => 'projects',
            'min' => 1,
            'max' => 50,
        ],
        'project_keyword_max_length' => [
            'type' => 'integer',
            'default' => 100,
            'description' => 'Maximum length for individual project keywords (characters)',
            'category' => 'projects',
            'min' => 20,
            'max' => 255,
        ],
        'project_note_reply_max_length' => [
            'type' => 'integer',
            'default' => 5000,
            'description' => 'Maximum length for project note replies (characters)',
            'category' => 'projects',
            'min' => 500,
            'max' => 10000,
        ],
        'project_progress_completed_weight' => [
            'type' => 'integer',
            'default' => 100,
            'description' => 'Weight for completed phases in progress calculation',
            'category' => 'projects',
            'min' => 0,
            'max' => 100,
        ],
        'project_progress_in_progress_weight' => [
            'type' => 'integer',
            'default' => 50,
            'description' => 'Weight for in-progress phases in progress calculation',
            'category' => 'projects',
            'min' => 0,
            'max' => 100,
        ],

        // ========== COMMITTEES ==========
        'discussion_committee_min_members' => [
            'type' => 'integer',
            'default' => 2,
            'description' => 'Minimum number of discussion committee members per project',
            'category' => 'committees',
            'min' => 1,
            'max' => 5,
        ],
        'discussion_committee_max_members' => [
            'type' => 'integer',
            'default' => 3,
            'description' => 'Maximum number of discussion committee members per project',
            'category' => 'committees',
            'min' => 1,
            'max' => 10,
        ],
        'committee_availability_moderate_threshold' => [
            'type' => 'integer',
            'default' => 2,
            'description' => 'Maximum assignments before member is considered moderately available',
            'category' => 'committees',
            'min' => 1,
            'max' => 10,
        ],
        'committee_review_comments_max_length' => [
            'type' => 'integer',
            'default' => 1000,
            'description' => 'Maximum length for committee review comments (characters)',
            'category' => 'committees',
            'min' => 200,
            'max' => 5000,
        ],

        // ========== SUPERVISORS ==========
        'supervisor_max_projects' => [
            'type' => 'integer',
            'default' => 5,
            'description' => 'Maximum number of projects a single supervisor can oversee',
            'category' => 'supervisors',
            'min' => 1,
            'max' => 50,
        ],
        'supervisor_response_max_length' => [
            'type' => 'integer',
            'default' => 1000,
            'description' => 'Maximum length for supervisor responses (characters)',
            'category' => 'supervisors',
            'min' => 200,
            'max' => 5000,
        ],

        // ========== DOCUMENTS ==========
        'document_upload_max_size_mb' => [
            'type' => 'integer',
            'default' => 10,
            'description' => 'Maximum document upload size in megabytes',
            'category' => 'documents',
            'min' => 1,
            'max' => 100,
        ],
        'document_max_chapters' => [
            'type' => 'integer',
            'default' => 6,
            'description' => 'Maximum number of document chapters',
            'category' => 'documents',
            'min' => 3,
            'max' => 20,
        ],
        'document_phase1_chapters' => [
            'type' => 'integer',
            'default' => 3,
            'description' => 'Number of chapters in Phase 1 (Final Defense Phase 1)',
            'category' => 'documents',
            'min' => 1,
            'max' => 10,
        ],
        'document_filename_max_length' => [
            'type' => 'integer',
            'default' => 200,
            'description' => 'Maximum length for sanitized document filenames (characters)',
            'category' => 'documents',
            'min' => 50,
            'max' => 500,
        ],
        'document_review_comments_max_length' => [
            'type' => 'integer',
            'default' => 5000,
            'description' => 'Maximum length for document review comments (characters)',
            'category' => 'documents',
            'min' => 500,
            'max' => 10000,
        ],

        // ========== MEETINGS ==========
        'meeting_duration_min' => [
            'type' => 'integer',
            'default' => 15,
            'description' => 'Minimum meeting duration in minutes',
            'category' => 'meetings',
            'min' => 5,
            'max' => 60,
        ],
        'meeting_duration_max' => [
            'type' => 'integer',
            'default' => 480,
            'description' => 'Maximum meeting duration in minutes (8 hours)',
            'category' => 'meetings',
            'min' => 60,
            'max' => 720,
        ],
        'meeting_duration_default' => [
            'type' => 'integer',
            'default' => 60,
            'description' => 'Default meeting duration in minutes',
            'category' => 'meetings',
            'min' => 15,
            'max' => 240,
        ],
        'meeting_location_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for meeting location (characters)',
            'category' => 'meetings',
            'min' => 50,
            'max' => 500,
        ],
        'meeting_agenda_max_length' => [
            'type' => 'integer',
            'default' => 5000,
            'description' => 'Maximum length for meeting agenda (characters)',
            'category' => 'meetings',
            'min' => 500,
            'max' => 10000,
        ],
        'meeting_notes_max_length' => [
            'type' => 'integer',
            'default' => 5000,
            'description' => 'Maximum length for meeting notes (characters)',
            'category' => 'meetings',
            'min' => 500,
            'max' => 10000,
        ],

        // ========== MILESTONES ==========
        'milestone_title_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for milestone title (characters)',
            'category' => 'milestones',
            'min' => 50,
            'max' => 500,
        ],
        'milestone_description_max_length' => [
            'type' => 'integer',
            'default' => 5000,
            'description' => 'Maximum length for milestone description (characters)',
            'category' => 'milestones',
            'min' => 500,
            'max' => 10000,
        ],

        // ========== EVALUATIONS ==========
        'evaluation_score_min' => [
            'type' => 'integer',
            'default' => 0,
            'description' => 'Minimum allowed evaluation score',
            'category' => 'evaluations',
            'min' => 0,
            'max' => 100,
        ],
        'evaluation_default_max_score' => [
            'type' => 'integer',
            'default' => 100,
            'description' => 'Default maximum score for evaluations',
            'category' => 'evaluations',
            'min' => 50,
            'max' => 200,
        ],

        // ========== REQUESTS ==========
        'request_reason_min_length' => [
            'type' => 'integer',
            'default' => 20,
            'description' => 'Minimum length for request reason (characters)',
            'category' => 'requests',
            'min' => 10,
            'max' => 100,
        ],

        // ========== AUTHENTICATION ==========
        'password_min_length' => [
            'type' => 'integer',
            'default' => 8,
            'description' => 'Minimum password length (characters)',
            'category' => 'authentication',
            'min' => 6,
            'max' => 20,
        ],
        'username_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for usernames (characters)',
            'category' => 'authentication',
            'min' => 20,
            'max' => 500,
        ],
        'email_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for email addresses (characters)',
            'category' => 'authentication',
            'min' => 50,
            'max' => 500,
        ],
        'user_full_name_min_length' => [
            'type' => 'integer',
            'default' => 2,
            'description' => 'Minimum length for user full names (characters)',
            'category' => 'authentication',
            'min' => 1,
            'max' => 10,
        ],
        'user_full_name_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for user full names (characters)',
            'category' => 'authentication',
            'min' => 50,
            'max' => 500,
        ],

        // ========== SEARCH & UI ==========
        'search_query_max_length' => [
            'type' => 'integer',
            'default' => 100,
            'description' => 'Maximum length for search queries (characters)',
            'category' => 'ui',
            'min' => 50,
            'max' => 500,
        ],
        'search_results_limit' => [
            'type' => 'integer',
            'default' => 50,
            'description' => 'Maximum number of search results to display',
            'category' => 'ui',
            'min' => 10,
            'max' => 500,
        ],
        'pagination_default_page_size' => [
            'type' => 'integer',
            'default' => 10,
            'description' => 'Default number of items per page in paginated lists',
            'category' => 'ui',
            'min' => 5,
            'max' => 100,
        ],
        'dashboard_display_limit' => [
            'type' => 'integer',
            'default' => 5,
            'description' => 'Maximum number of items to display in dashboard widgets',
            'category' => 'ui',
            'min' => 3,
            'max' => 20,
        ],
        'dashboard_soon_milestone_days_threshold' => [
            'type' => 'integer',
            'default' => 7,
            'description' => 'Number of days ahead to consider milestones as "upcoming soon"',
            'category' => 'ui',
            'min' => 1,
            'max' => 30,
        ],

        // ========== PERIODS ==========
        'period_name_max_length' => [
            'type' => 'integer',
            'default' => 255,
            'description' => 'Maximum length for period names (characters)',
            'category' => 'periods',
            'min' => 50,
            'max' => 500,
        ],
    ];

    /**
     * Get group minimum members setting
     */
    public function getGroupMinMembers(): int
    {
        return (int) Setting::get('group_min_members', self::DEFINITIONS['group_min_members']['default']);
    }

    /**
     * Get group maximum members setting
     */
    public function getGroupMaxMembers(): int
    {
        return (int) Setting::get('group_max_members', self::DEFINITIONS['group_max_members']['default']);
    }

    /**
     * Get max proposals per group submission
     */
    public function getMaxProposalsPerGroupSubmission(): int
    {
        return (int) Setting::get('max_proposals_per_group_submission', self::DEFINITIONS['max_proposals_per_group_submission']['default']);
    }

    /**
     * Get max projects per group
     */
    public function getMaxProjectsPerGroup(): int
    {
        return (int) Setting::get('max_projects_per_group', self::DEFINITIONS['max_projects_per_group']['default']);
    }

    /**
     * Get discussion committee minimum members per project
     */
    public function getDiscussionCommitteeMinMembers(): int
    {
        return (int) Setting::get('discussion_committee_min_members', self::DEFINITIONS['discussion_committee_min_members']['default']);
    }

    /**
     * Get discussion committee maximum members per project
     */
    public function getDiscussionCommitteeMaxMembers(): int
    {
        return (int) Setting::get('discussion_committee_max_members', self::DEFINITIONS['discussion_committee_max_members']['default']);
    }

    /**
     * Get supervisor max projects
     */
    public function getSupervisorMaxProjects(): int
    {
        return (int) Setting::get('supervisor_max_projects', self::DEFINITIONS['supervisor_max_projects']['default']);
    }

    /**
     * Get project default max students (when creating from proposal)
     */
    public function getProjectDefaultMaxStudents(): int
    {
        return (int) Setting::get('project_default_max_students', self::DEFINITIONS['project_default_max_students']['default']);
    }

    /**
     * Get proposal title max length
     */
    public function getProposalTitleMaxLength(): int
    {
        return (int) Setting::get('proposal_title_max_length', self::DEFINITIONS['proposal_title_max_length']['default']);
    }

    /**
     * Get document upload max size in MB
     */
    public function getDocumentUploadMaxSizeMb(): int
    {
        return (int) Setting::get('document_upload_max_size_mb', self::DEFINITIONS['document_upload_max_size_mb']['default']);
    }

    /**
     * Get group name max length
     */
    public function getGroupNameMaxLength(): int
    {
        return (int) Setting::get('group_name_max_length', self::DEFINITIONS['group_name_max_length']['default']);
    }

    /**
     * Get group join request message max length
     */
    public function getGroupJoinRequestMessageMaxLength(): int
    {
        return (int) Setting::get('group_join_request_message_max_length', self::DEFINITIONS['group_join_request_message_max_length']['default']);
    }

    /**
     * Get proposal title min length
     */
    public function getProposalTitleMinLength(): int
    {
        return (int) Setting::get('proposal_title_min_length', self::DEFINITIONS['proposal_title_min_length']['default']);
    }

    /**
     * Get proposal description min length
     */
    public function getProposalDescriptionMinLength(): int
    {
        return (int) Setting::get('proposal_description_min_length', self::DEFINITIONS['proposal_description_min_length']['default']);
    }

    /**
     * Get project max students limit
     */
    public function getProjectMaxStudentsLimit(): int
    {
        return (int) Setting::get('project_max_students_limit', self::DEFINITIONS['project_max_students_limit']['default']);
    }

    /**
     * Get project keyword max length
     */
    public function getProjectKeywordMaxLength(): int
    {
        return (int) Setting::get('project_keyword_max_length', self::DEFINITIONS['project_keyword_max_length']['default']);
    }

    /**
     * Get project note reply max length
     */
    public function getProjectNoteReplyMaxLength(): int
    {
        return (int) Setting::get('project_note_reply_max_length', self::DEFINITIONS['project_note_reply_max_length']['default']);
    }

    /**
     * Get project progress completed weight
     */
    public function getProjectProgressCompletedWeight(): int
    {
        return (int) Setting::get('project_progress_completed_weight', self::DEFINITIONS['project_progress_completed_weight']['default']);
    }

    /**
     * Get project progress in progress weight
     */
    public function getProjectProgressInProgressWeight(): int
    {
        return (int) Setting::get('project_progress_in_progress_weight', self::DEFINITIONS['project_progress_in_progress_weight']['default']);
    }

    /**
     * Get committee availability moderate threshold
     */
    public function getCommitteeAvailabilityModerateThreshold(): int
    {
        return (int) Setting::get('committee_availability_moderate_threshold', self::DEFINITIONS['committee_availability_moderate_threshold']['default']);
    }

    /**
     * Get committee review comments max length
     */
    public function getCommitteeReviewCommentsMaxLength(): int
    {
        return (int) Setting::get('committee_review_comments_max_length', self::DEFINITIONS['committee_review_comments_max_length']['default']);
    }

    /**
     * Get supervisor response max length
     */
    public function getSupervisorResponseMaxLength(): int
    {
        return (int) Setting::get('supervisor_response_max_length', self::DEFINITIONS['supervisor_response_max_length']['default']);
    }

    /**
     * Get document max chapters
     */
    public function getDocumentMaxChapters(): int
    {
        return (int) Setting::get('document_max_chapters', self::DEFINITIONS['document_max_chapters']['default']);
    }

    /**
     * Get document phase 1 chapters
     */
    public function getDocumentPhase1Chapters(): int
    {
        return (int) Setting::get('document_phase1_chapters', self::DEFINITIONS['document_phase1_chapters']['default']);
    }

    /**
     * Get document filename max length
     */
    public function getDocumentFilenameMaxLength(): int
    {
        return (int) Setting::get('document_filename_max_length', self::DEFINITIONS['document_filename_max_length']['default']);
    }

    /**
     * Get document review comments max length
     */
    public function getDocumentReviewCommentsMaxLength(): int
    {
        return (int) Setting::get('document_review_comments_max_length', self::DEFINITIONS['document_review_comments_max_length']['default']);
    }

    /**
     * Get meeting duration min
     */
    public function getMeetingDurationMin(): int
    {
        return (int) Setting::get('meeting_duration_min', self::DEFINITIONS['meeting_duration_min']['default']);
    }

    /**
     * Get meeting duration max
     */
    public function getMeetingDurationMax(): int
    {
        return (int) Setting::get('meeting_duration_max', self::DEFINITIONS['meeting_duration_max']['default']);
    }

    /**
     * Get meeting duration default
     */
    public function getMeetingDurationDefault(): int
    {
        return (int) Setting::get('meeting_duration_default', self::DEFINITIONS['meeting_duration_default']['default']);
    }

    /**
     * Get meeting location max length
     */
    public function getMeetingLocationMaxLength(): int
    {
        return (int) Setting::get('meeting_location_max_length', self::DEFINITIONS['meeting_location_max_length']['default']);
    }

    /**
     * Get meeting agenda max length
     */
    public function getMeetingAgendaMaxLength(): int
    {
        return (int) Setting::get('meeting_agenda_max_length', self::DEFINITIONS['meeting_agenda_max_length']['default']);
    }

    /**
     * Get meeting notes max length
     */
    public function getMeetingNotesMaxLength(): int
    {
        return (int) Setting::get('meeting_notes_max_length', self::DEFINITIONS['meeting_notes_max_length']['default']);
    }

    /**
     * Get milestone title max length
     */
    public function getMilestoneTitleMaxLength(): int
    {
        return (int) Setting::get('milestone_title_max_length', self::DEFINITIONS['milestone_title_max_length']['default']);
    }

    /**
     * Get milestone description max length
     */
    public function getMilestoneDescriptionMaxLength(): int
    {
        return (int) Setting::get('milestone_description_max_length', self::DEFINITIONS['milestone_description_max_length']['default']);
    }

    /**
     * Get evaluation score min
     */
    public function getEvaluationScoreMin(): int
    {
        return (int) Setting::get('evaluation_score_min', self::DEFINITIONS['evaluation_score_min']['default']);
    }

    /**
     * Get evaluation default max score
     */
    public function getEvaluationDefaultMaxScore(): int
    {
        return (int) Setting::get('evaluation_default_max_score', self::DEFINITIONS['evaluation_default_max_score']['default']);
    }

    /**
     * Get request reason min length
     */
    public function getRequestReasonMinLength(): int
    {
        return (int) Setting::get('request_reason_min_length', self::DEFINITIONS['request_reason_min_length']['default']);
    }

    /**
     * Get password min length
     */
    public function getPasswordMinLength(): int
    {
        return (int) Setting::get('password_min_length', self::DEFINITIONS['password_min_length']['default']);
    }

    /**
     * Get username max length
     */
    public function getUsernameMaxLength(): int
    {
        return (int) Setting::get('username_max_length', self::DEFINITIONS['username_max_length']['default']);
    }

    /**
     * Get email max length
     */
    public function getEmailMaxLength(): int
    {
        return (int) Setting::get('email_max_length', self::DEFINITIONS['email_max_length']['default']);
    }

    /**
     * Get user full name min length
     */
    public function getUserFullNameMinLength(): int
    {
        return (int) Setting::get('user_full_name_min_length', self::DEFINITIONS['user_full_name_min_length']['default']);
    }

    /**
     * Get user full name max length
     */
    public function getUserFullNameMaxLength(): int
    {
        return (int) Setting::get('user_full_name_max_length', self::DEFINITIONS['user_full_name_max_length']['default']);
    }

    /**
     * Get search query max length
     */
    public function getSearchQueryMaxLength(): int
    {
        return (int) Setting::get('search_query_max_length', self::DEFINITIONS['search_query_max_length']['default']);
    }

    /**
     * Get search results limit
     */
    public function getSearchResultsLimit(): int
    {
        return (int) Setting::get('search_results_limit', self::DEFINITIONS['search_results_limit']['default']);
    }

    /**
     * Get pagination default page size
     */
    public function getPaginationDefaultPageSize(): int
    {
        return (int) Setting::get('pagination_default_page_size', self::DEFINITIONS['pagination_default_page_size']['default']);
    }

    /**
     * Get dashboard display limit
     */
    public function getDashboardDisplayLimit(): int
    {
        return (int) Setting::get('dashboard_display_limit', self::DEFINITIONS['dashboard_display_limit']['default']);
    }

    /**
     * Get dashboard soon milestone days threshold
     */
    public function getDashboardSoonMilestoneDaysThreshold(): int
    {
        return (int) Setting::get('dashboard_soon_milestone_days_threshold', self::DEFINITIONS['dashboard_soon_milestone_days_threshold']['default']);
    }

    /**
     * Get period name max length
     */
    public function getPeriodNameMaxLength(): int
    {
        return (int) Setting::get('period_name_max_length', self::DEFINITIONS['period_name_max_length']['default']);
    }

    public function setGroupMinMembers(int $value): void
    {
        Setting::set('group_min_members', $value, 'integer', self::DEFINITIONS['group_min_members']['description']);
    }

    public function setGroupMaxMembers(int $value): void
    {
        Setting::set('group_max_members', $value, 'integer', self::DEFINITIONS['group_max_members']['description']);
    }

    public function setMaxProposalsPerGroupSubmission(int $value): void
    {
        Setting::set('max_proposals_per_group_submission', $value, 'integer', self::DEFINITIONS['max_proposals_per_group_submission']['description']);
    }

    public function setMaxProjectsPerGroup(int $value): void
    {
        Setting::set('max_projects_per_group', $value, 'integer', self::DEFINITIONS['max_projects_per_group']['description']);
    }

    public function setDiscussionCommitteeMinMembers(int $value): void
    {
        Setting::set('discussion_committee_min_members', $value, 'integer', self::DEFINITIONS['discussion_committee_min_members']['description']);
    }

    public function setDiscussionCommitteeMaxMembers(int $value): void
    {
        Setting::set('discussion_committee_max_members', $value, 'integer', self::DEFINITIONS['discussion_committee_max_members']['description']);
    }

    public function setSupervisorMaxProjects(int $value): void
    {
        Setting::set('supervisor_max_projects', $value, 'integer', self::DEFINITIONS['supervisor_max_projects']['description']);
    }

    public function setProjectDefaultMaxStudents(int $value): void
    {
        Setting::set('project_default_max_students', $value, 'integer', self::DEFINITIONS['project_default_max_students']['description']);
    }

    public function setProposalTitleMaxLength(int $value): void
    {
        Setting::set('proposal_title_max_length', $value, 'integer', self::DEFINITIONS['proposal_title_max_length']['description']);
    }

    public function setDocumentUploadMaxSizeMb(int $value): void
    {
        Setting::set('document_upload_max_size_mb', $value, 'integer', self::DEFINITIONS['document_upload_max_size_mb']['description']);
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

    /**
     * Get all settings as key => value for display (e.g. frontend)
     */
    public function getAllForDisplay(): array
    {
        $out = [];
        foreach (array_keys(self::DEFINITIONS) as $key) {
            $out[$key] = $this->get($key, self::DEFINITIONS[$key]['default']);
        }
        return $out;
    }

    /**
     * Get all settings with metadata for admin (list/edit)
     */
    public function getAllWithDefinitions(): array
    {
        $out = [];
        foreach (self::DEFINITIONS as $key => $def) {
            $out[] = [
                'key' => $key,
                'value' => Setting::get($key, $def['default']),
                'type' => $def['type'],
                'description' => $def['description'],
                'category' => $def['category'],
                'min' => $def['min'] ?? null,
                'max' => $def['max'] ?? null,
                'default' => $def['default'],
            ];
        }
        return $out;
    }

    /**
     * Bulk update settings from key => value array
     */
    public function bulkUpdate(array $settings): void
    {
        foreach ($settings as $key => $value) {
            if (!array_key_exists($key, self::DEFINITIONS)) {
                continue;
            }
            $def = self::DEFINITIONS[$key];
            $type = $def['type'];
            if ($type === 'integer') {
                $value = (int) $value;
                $min = $def['min'] ?? null;
                $max = $def['max'] ?? null;
                if ($min !== null && $value < $min) {
                    $value = $min;
                }
                if ($max !== null && $value > $max) {
                    $value = $max;
                }
            }
            Setting::set($key, $value, $type, $def['description']);
        }
    }
}
