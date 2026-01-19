<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $projects = Project::all();
        $proposals = Proposal::all();

        foreach ($users as $user) {
            // Create a few notifications for each user
            $notificationCount = fake()->numberBetween(2, 5);

            for ($i = 0; $i < $notificationCount; $i++) {
                $relatedEntity = null;
                $relatedId = null;
                
                if (fake()->boolean(60)) {
                    $relatedEntity = fake()->randomElement([
                        Project::class,
                        Proposal::class,
                    ]);

                    if ($relatedEntity === Project::class && $projects->isNotEmpty()) {
                        $relatedId = $projects->random()->id;
                    } elseif ($relatedEntity === Proposal::class && $proposals->isNotEmpty()) {
                        $relatedId = $proposals->random()->id;
                    }
                }

                Notification::factory()
                    ->create([
                        'user_id' => $user->id,
                        'related_entity_type' => $relatedEntity,
                        'related_entity_id' => $relatedId,
                    ]);
            }
        }

        $this->command->info('Created notifications for ' . $users->count() . ' users');
    }
}
