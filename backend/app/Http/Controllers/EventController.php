<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with(['creator', 'participants'])
            ->active()
            ->upcoming()
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5000',
            'category' => 'required|string|in:general,wellness,meditation,fitness,education',
            'max_participants' => 'nullable|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $eventData = $request->only([
            'title', 'description', 'location', 'start_date', 'end_date', 'category', 'max_participants'
        ]);
        $eventData['created_by'] = auth()->id();

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events/images', 'public');
            $eventData['image_path'] = $imagePath;
        }

        $event = Event::create($eventData);

        return response()->json($event, 201);
    }

    public function show($id)
    {
        $event = Event::with(['creator', 'participants'])
            ->findOrFail($id);

        return response()->json($event);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // Only allow creator or admin to update
        if ($event->created_by !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'nullable|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category' => 'sometimes|string|in:general,wellness,meditation,fitness,education',
            'max_participants' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = $request->only([
            'title', 'description', 'location', 'start_date', 'end_date', 
            'category', 'max_participants', 'is_active'
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($event->image_path) {
                Storage::disk('public')->delete($event->image_path);
            }
            $imagePath = $request->file('image')->store('events/images', 'public');
            $updateData['image_path'] = $imagePath;
        }

        $event->update($updateData);

        return response()->json($event);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);

        // Only allow creator or admin to delete
        if ($event->created_by !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete image if exists
        if ($event->image_path) {
            Storage::disk('public')->delete($event->image_path);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }

    public function join($id)
    {
        $event = Event::findOrFail($id);

        if (!$event->is_active) {
            return response()->json(['message' => 'Event is not active'], 400);
        }

        if ($event->isPast()) {
            return response()->json(['message' => 'Event has already ended'], 400);
        }

        // Check if user is already participating
        if ($event->participants()->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'You are already participating in this event'], 400);
        }

        // Check if event is full
        if ($event->max_participants && $event->getAvailableSpots() <= 0) {
            return response()->json(['message' => 'Event is full'], 400);
        }

        $event->participants()->attach(auth()->id());

        return response()->json(['message' => 'Successfully joined the event']);
    }

    public function leave($id)
    {
        $event = Event::findOrFail($id);

        $event->participants()->detach(auth()->id());

        return response()->json(['message' => 'Successfully left the event']);
    }

    public function getSuggestions()
    {
        $userId = auth()->id();
        
        // Get user's interests based on their activity
        $userChallenges = auth()->user()->challengeProgress()->pluck('challenge_id');
        $userSavedPosts = auth()->user()->savedPosts()->pluck('post_id');
        
        // Get events in categories that match user's interests
        $suggestedEvents = Event::with(['creator', 'participants'])
            ->active()
            ->upcoming()
            ->whereNotIn('id', function($query) use ($userId) {
                $query->select('event_id')
                      ->from('event_participants')
                      ->where('user_id', $userId);
            })
            ->orderBy('start_date', 'asc')
            ->limit(10)
            ->get();

        return response()->json($suggestedEvents);
    }
}
