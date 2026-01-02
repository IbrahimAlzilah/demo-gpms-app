<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Gate;
use App\Models\Proposal;
use App\Models\Document;
use App\Models\Project;
use App\Models\Grade;
use App\Models\ProjectRequest;
use App\Models\ProjectRegistration;
use App\Policies\ProposalPolicy;
use App\Policies\DocumentPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\GradePolicy;
use App\Policies\ProjectRequestPolicy;
use App\Policies\ProjectRegistrationPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Proposal::class => ProposalPolicy::class,
        Document::class => DocumentPolicy::class,
        Project::class => ProjectPolicy::class,
        Grade::class => GradePolicy::class,
        ProjectRequest::class => ProjectRequestPolicy::class,
        ProjectRegistration::class => ProjectRegistrationPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for MySQL key length issue with utf8mb4
        Schema::defaultStringLength(191);

        // Register policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        // Explicit route model binding for clarity
        \Illuminate\Support\Facades\Route::bind('registration', function ($value) {
            return \App\Models\ProjectRegistration::findOrFail($value);
        });

        \Illuminate\Support\Facades\Route::bind('invitation', function ($value) {
            return \App\Models\GroupInvitation::findOrFail($value);
        });

        \Illuminate\Support\Facades\Route::bind('request', function ($value) {
            return \App\Models\ProjectRequest::findOrFail($value);
        });

        \Illuminate\Support\Facades\Route::bind('note', function ($value) {
            return \App\Models\SupervisorNote::findOrFail($value);
        });

        \Illuminate\Support\Facades\Route::bind('milestone', function ($value) {
            return \App\Models\ProjectMilestone::findOrFail($value);
        });

        \Illuminate\Support\Facades\Route::bind('meeting', function ($value) {
            return \App\Models\ProjectMeeting::findOrFail($value);
        });
    }
}
