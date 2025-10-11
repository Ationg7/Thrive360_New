<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\UserChallengeProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChallengeController extends Controller
{
    public function index()
    {
        $challenges = Challenge::active()->orderBy('created_at', 'desc')->get();
        return response()->json($challenges);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('Challenge creation request received', $request->all());
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:1000',
                'type' => 'required|in:Daily,Weekly,Monthly',
                'days_left' => 'nullable|integer|min:0',
                'theme' => 'nullable|string|max:50',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $challengeData = $request->only([
                'title', 'description', 'type', 'days_left', 'theme', 'start_date', 'end_date'
            ]);
            
            $userId = auth()->id();
            if (!$userId) {
                \Log::error('User not authenticated');
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $challengeData['user_id'] = $userId;
            $challengeData['status'] = 'Not Started';

            \Log::info('Creating challenge with data', $challengeData);

            $challenge = Challenge::create($challengeData);

            \Log::info('Challenge created successfully', ['id' => $challenge->id]);

            return response()->json($challenge, 201);
        } catch (\Exception $e) {
            \Log::error('Error creating challenge', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $challenge = Challenge::with('userProgress')->findOrFail($id);
        return response()->json($challenge);
    }

    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);
        
        // Only allow update if user owns the challenge
        if (auth()->id() !== $challenge->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => 'sometimes|in:Daily,Weekly,Monthly',
            'days_left' => 'nullable|integer|min:0',
            'theme' => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $challenge->update($request->only([
            'title', 'description', 'type', 'days_left', 'theme', 'is_active'
        ]));

        return response()->json($challenge);
    }

    public function join(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);
        
        if (!auth()->check()) {
            return response()->json(['message' => 'Login required to join challenges'], 401);
        }

        $userId = auth()->id();
        
        // Check if user already joined
        $existingProgress = UserChallengeProgress::where('user_id', $userId)
            ->where('challenge_id', $id)
            ->first();

        if ($existingProgress) {
            return response()->json(['message' => 'Already joined this challenge'], 400);
        }

        // Create progress record
        $progress = UserChallengeProgress::create([
            'user_id' => $userId,
            'challenge_id' => $id,
            'status' => 'Not Started',
            'progress_percentage' => 0,
        ]);

        // Increment participants count
        $challenge->incrementParticipants();

        return response()->json([
            'message' => 'Successfully joined challenge',
            'progress' => $progress
        ]);
    }

    public function updateProgress(Request $request, $id)
    {
        $userId = auth()->id();
        
        $progress = UserChallengeProgress::where('user_id', $userId)
            ->where('challenge_id', $id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'progress_percentage' => 'required|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $progress->updateProgress($request->progress_percentage);

        return response()->json([
            'message' => 'Progress updated successfully',
            'progress' => $progress
        ]);
    }

    public function getUserProgress($id)
    {
        $userId = auth()->id();
        
        $progress = UserChallengeProgress::where('user_id', $userId)
            ->where('challenge_id', $id)
            ->with('challenge')
            ->first();

        if (!$progress) {
            return response()->json(['message' => 'No progress found for this challenge'], 404);
        }

        return response()->json($progress);
    }

    public function getUserHistory()
    {
        $userId = auth()->id();
        
        $challengeHistory = UserChallengeProgress::with(['challenge'])
            ->where('user_id', $userId)
            ->whereHas('challenge')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($progress) {
                return [
                    'id' => $progress->id,
                    'challenge_id' => $progress->challenge_id,
                    'challenge_title' => optional($progress->challenge)->title,
                    'challenge_type' => optional($progress->challenge)->type,
                    'status' => $progress->status,
                    'progress_percentage' => $progress->progress_percentage,
                    'joined_at' => $progress->created_at,
                    'last_updated' => $progress->updated_at,
                    'is_completed' => $progress->status === 'Completed'
                ];
            });

        return response()->json($challengeHistory);
    }

    public function destroy($id)
    {
        $challenge = Challenge::findOrFail($id);
        
        // Only allow deletion if user owns the challenge
        if (auth()->id() !== $challenge->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $challenge->delete();

        return response()->json(['message' => 'Challenge deleted successfully']);
    }
}
