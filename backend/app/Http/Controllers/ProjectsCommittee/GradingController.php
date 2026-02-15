<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\GradingEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Project Committee only: aggregation and grading endpoints.
 * Strict RBAC - middleware ensures projects_committee role.
 */
class GradingController extends Controller
{
    public function __construct(
        protected GradingEngineService $gradingEngine
    ) {}

    /**
     * Get aggregated grades for a project and defense stage.
     * Returns: Raw grades (Supervisor + Committee Members), Committee Total,
     * Supervisor Contribution, Final Grade per student.
     *
     * GET /projects-committee/grading/aggregation/{project}/{stage}
     */
    public function getAggregation(Request $request, Project $project, string $stage): JsonResponse
    {
        if (!in_array($stage, ['fd1', 'fd2'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid defense stage. Must be fd1 or fd2.',
            ], 400);
        }

        try {
            $data = $this->gradingEngine->getAggregatedGrades($project, $stage);

            return response()->json([
                'success' => true,
                'data' => [
                    'project' => [
                        'id' => $project->id,
                        'title' => $project->title,
                        'defenseStage' => $stage,
                    ],
                    'aggregations' => $data,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
