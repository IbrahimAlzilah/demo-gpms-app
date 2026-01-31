<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportFiltersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'period_id' => 'nullable|exists:time_periods,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'status' => 'nullable|string',
            'role' => 'nullable|in:student,supervisor,discussion_committee,projects_committee,admin',
            'supervisor_id' => 'nullable|exists:users,id',
            'project_specialization' => 'nullable|string',
            'department' => 'nullable|string',
            'request_status' => 'nullable|string',
            'request_type' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'period_id.exists' => 'The selected period does not exist.',
            'date_to.after_or_equal' => 'The end date must be after or equal to the start date.',
            'supervisor_id.exists' => 'The selected supervisor does not exist.',
        ];
    }
}
