<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Challenge;

class ChallengeSeeder extends Seeder
{
    public function run()
    {
        $sampleChallenges = [
            [
                'title' => 'Morning Mindfulness',
                'description' => 'Start your daily with 5 minutes of mindful breathing to center yourself before classes begin.',
                   'category' => 'Daily',
                   'difficulty_level' => 'Easy',
                'status' => 'Progress',
                'days_left' => 2,
                'participants' => 120,
                'progress_percentage' => null,
                'theme' => 'blue',
                'is_active' => true,
            ],
            [
                'title' => 'Digital Detox',
                'description' => 'Spend 2 hours each day without digital devices. Use the time for reading, walking, or in-person connections.',
                   'category' => 'Weekly',
                   'difficulty_level' => 'Medium',
                'status' => 'Progress',
                'days_left' => 5,
                'participants' => 156,
                'progress_percentage' => 30,
                'theme' => 'purple',
                'is_active' => true,
            ],
            [
                'title' => 'Gratitude Journal',
                'description' => 'Write down three things you\'re grateful for each day this month. Watch how it transforms your outlook.',
                   'category' => 'Monthly',
                   'difficulty_level' => 'Easy',
                'status' => 'Not Started',
                'days_left' => null,
                'participants' => 83,
                'progress_percentage' => null,
                'theme' => 'lightblue',
                'is_active' => true,
            ],
            [
                'title' => 'Hydration Challenge',
                'description' => 'Drink 8 glasses of water daily for a week. Stay hydrated and feel the difference in your energy levels.',
                   'category' => 'Weekly',
                   'difficulty_level' => 'Easy',
                'status' => 'Not Started',
                'days_left' => 7,
                'participants' => 45,
                'progress_percentage' => null,
                'theme' => 'green',
                'is_active' => true,
            ],
            [
                'title' => 'Evening Reflection',
                'description' => 'Spend 10 minutes each evening reflecting on your day. What went well? What could be improved?',
                   'category' => 'Daily',
                   'difficulty_level' => 'Medium',
                'status' => 'Not Started',
                'days_left' => 14,
                'participants' => 67,
                'progress_percentage' => null,
                'theme' => 'orange',
                'is_active' => true,
            ],
        ];

        foreach ($sampleChallenges as $challenge) {
            Challenge::create($challenge);
        }
    }
}
