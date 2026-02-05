<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $model = $this->resource;
        if ($model === null) {
            return [];
        }

        // Load profile relationships on the underlying model (not on the Resource)
        if (is_object($model) && method_exists($model, 'loadMissing')) {
            $model->loadMissing(['studentProfile', 'supervisorProfile']);
        }

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'username' => $this->username,
            'role' => $this->role,
            'status' => $this->status,
            'studentId' => $this->studentProfile?->student_id,
            'empId' => $this->supervisorProfile?->emp_id,
            'department' => $this->studentProfile?->major ?? $this->supervisorProfile?->department,
            'specialization' => $this->role === 'student' ? ($this->studentProfile?->major ?? null) : null,
            'academicLevel' => $this->role === 'student' ? ($this->studentProfile?->academic_level ?? null) : null,
            'phone' => $this->phone,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}

