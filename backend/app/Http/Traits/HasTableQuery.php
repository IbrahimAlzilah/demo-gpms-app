<?php

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasTableQuery
{
    /**
     * Apply table query parameters to a query builder
     */
    protected function applyTableQuery(Builder $query, Request $request): Builder
    {
        // Apply search
        if ($request->has('search') && $request->search) {
            $query = $this->applySearch($query, $request->search);
        }

        // Apply filters
        if ($request->has('filters') && is_array($request->filters)) {
            $query = $this->applyFilters($query, $request->filters);
        }

        // Apply sorting
        if ($request->has('sortBy') && $request->sortBy) {
            $sortOrder = $request->get('sortOrder', 'asc');
            $query = $this->applySorting($query, $request->sortBy, $sortOrder);
        }

        return $query;
    }

    /**
     * Get paginated response
     */
    protected function getPaginatedResponse(Builder $query, Request $request, int $defaultPageSize = 10): array
    {
        $page = (int) $request->get('page', 1);
        $pageSize = (int) $request->get('pageSize', $defaultPageSize);

        $total = $query->count();
        $totalPages = ceil($total / $pageSize);

        $data = $query->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get();

        return [
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ];
    }

    /**
     * Apply search to query (override in controller for custom search)
     */
    protected function applySearch(Builder $query, string $search): Builder
    {
        // Default implementation - override in controllers
        return $query;
    }

    /**
     * Apply filters to query (override in controller for custom filters)
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        // Default implementation - override in controllers
        foreach ($filters as $key => $value) {
            if ($value !== null && $value !== '') {
                $query->where($key, $value);
            }
        }
        return $query;
    }

    /**
     * Apply sorting to query (override in controller for custom sorting)
     */
    protected function applySorting(Builder $query, string $sortBy, string $sortOrder): Builder
    {
        return $query->orderBy($sortBy, $sortOrder);
    }
}

