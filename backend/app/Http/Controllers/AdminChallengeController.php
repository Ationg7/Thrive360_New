<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Challenge;
use Illuminate\Support\Facades\Storage;
use App\Models\Setting;

class AdminChallengeController extends Controller
{
 // Fetch all challenges
public function index()
{$challenges = Challenge::with('user')
    ->with('participantsList.user:id,name')
    ->withCount('participantsList')
    ->orderBy('created_at', 'desc')
    ->get()
    ->map(function ($challenge) {
        // Participants count for frontend
        $challenge->user_progress_count = $challenge->participants_list_count;

       

        return $challenge;
    });

    return response()->json($challenges);
}

 


    // Upload a new challenge
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'difficulty_level' => 'required|string',
            'category' => 'required|in:Daily,Weekly,Monthly',
        ]);

        $challenge = new Challenge($request->only([
            'title', 'description','difficulty_level', 'category'
        ]));


        $challenge->save();

        // Notify all users (respect admin notification setting)
        $notificationsEnabled = Setting::getValue('email_notifications', false);
        if ($notificationsEnabled) {
            $users = \App\Models\User::all();
            foreach ($users as $user) {
                \App\Models\Notification::createNotification(
                    $user->id,
                    'challenge_joined',
                    'New Challenge Available',
                    "A new challenge '{$challenge->title}' is now available.",
                    [
                        'challenge_id' => $challenge->id,
                        'redirect_url' => url("/challenges/{$challenge->id}") // redirect URL
                    ]
                );
            }
        }

        return response()->json($challenge);
    }

    // Update a challenge
    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'difficulty_level' => 'sometimes|string',
            'category' => 'sometimes|string',
        ]);

        $challenge->update($request->only([
            'title', 'description', 'difficulty_level', 'category'
        ]));


        // Return the challenge with the same structure as index method
        $challenge = $challenge->load('user')
            ->load('participantsList.user:id,name')
            ->loadCount('participantsList');
        
        // Add the same computed fields as index method
        $challenge->user_progress_count = $challenge->participants_list_count;
       

        return response()->json($challenge);
    }

    // Delete a challenge
    public function destroy($id)
    {
        $challenge = Challenge::findOrFail($id);


        $challenge->delete();

        return response()->json(['message' => 'Challenge deleted successfully']);
    }
}
