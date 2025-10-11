<?php

namespace App\Http\Controllers;

use App\Models\FreedomWallPost;
use App\Models\PostReport;
use App\Models\SavedPost;
use App\Models\Notification;
use App\Models\UserPostReaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FreedomWallController extends Controller
{
    public function index()
    {
        $posts = FreedomWallPost::with(['user','savedByUsers', 'reactions'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Add user's saved status and reaction data
        $posts = $posts->map(function ($post) {
            $isSaved = auth()->check() ? $post->isSavedByUser(auth()->id()) : false;
            $userReaction = auth()->check() ? $post->getUserReaction(auth()->id()) : null;
            $reactionCounts = $post->getReactionCounts();
            
            return [
                'id' => $post->id,
                'content' => $post->content,
                'author' => $post->author,
                'email' => $post->user ? $post->user->email : null,

                'image_path' => $post->image_path,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                'likes' => $reactionCounts['like'],
                'hearts' => $reactionCounts['heart'],
                'sad' => $reactionCounts['sad'],
                'saves' => $post->saves ?? 0,
                'is_saved' => $isSaved,
                'user_reaction' => $userReaction
            ];
        });

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $postData = [
            'content' => $request->content,
            'author' => auth()->check() ? (auth()->user()->name ?? 'Anonymous') : 'Anonymous',
            'is_guest_post' => !auth()->check(),
            'user_id' => auth()->id(),
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('freedom-wall-images', 'public');
            $postData['image_path'] = $imagePath;
        }

        $post = FreedomWallPost::create($postData);

        // shape response similar to index()
        $reactionCounts = $post->getReactionCounts();
        return response()->json([
            'id' => $post->id,
            'content' => $post->content,
            'author' => $post->author,
            'email' => $post->user ? $post->user->email : null,
            'image_path' => $post->image_path,
            'created_at' => $post->created_at,
            'likes' => $reactionCounts['like'],
            'hearts' => $reactionCounts['heart'],
            'sad' => $reactionCounts['sad'],
            'saves' => $post->saves ?? 0,
            'is_saved' => false,
            'user_reaction' => null
        ], 201);
    }

    public function react(Request $request, $postId)
{
    $request->validate([
        'reaction_type' => 'required|string|in:like,heart,sad',
    ]);

    $post = FreedomWallPost::findOrFail($postId);
    $reactionType = $request->reaction_type;
    $userId = auth()->id();

    // Check if user already reacted to this post
    $existingReaction = UserPostReaction::where('user_id', $userId)
        ->where('post_id', $postId)
        ->first();

    if ($existingReaction) {
        if ($existingReaction->reaction_type === $reactionType) {
            $existingReaction->delete();
            $userReaction = null;
        } else {
            $existingReaction->update(['reaction_type' => $reactionType]);
            $userReaction = $reactionType;
        }
    } else {
        UserPostReaction::create([
            'user_id' => $userId,
            'post_id' => $postId,
            'reaction_type' => $reactionType
        ]);
        $userReaction = $reactionType;

        // ✅ Notify post owner if not the same user
        if ($post->user_id && $post->user_id !== $userId) {
            Notification::createNotification(
                $post->user_id,
                'reaction',
                'New Reaction on Your Post',
                'Someone reacted to your post with a ' . $reactionType . ' emoji.',
                [
                    'post_id' => $post->id,
                    'reaction_type' => $reactionType,
                    'redirect_url' => '/Home?postId=' . $post->id
                ]
            );
        }
    }

    // Get updated reaction counts
    $reactionCounts = $post->getReactionCounts();

    return response()->json([
        'likes' => $reactionCounts['like'],
        'hearts' => $reactionCounts['heart'],
        'sad' => $reactionCounts['sad'],
        'user_reaction' => $userReaction,
    ]);
}


    public function save(Request $request, FreedomWallPost $post)
    {
        $userId = auth()->id();
        
        $savedPost = SavedPost::where('user_id', $userId)
            ->where('post_id', $post->id)
            ->first();

        if ($savedPost) {
            // Unsave the post
            $savedPost->delete();
            $isSaved = false;
        } else {
            // Save the post
            SavedPost::create([
                'user_id' => $userId,
                'post_id' => $post->id
            ]);
            $isSaved = true;

            // Create notification for post author if different from current user
            if ($post->user_id && $post->user_id !== $userId) {
                Notification::createNotification(
                    $post->user_id,
                    'save',
                    'Post Saved',
                    'Someone saved your post',
                    [
                        'post_id' => $post->id,
                        'redirect_url' => '/Home?postId=' . $post->id
                    ]
                );
            }
        }

        // Update the saves count on the post
        $post->saves = $post->savedByUsers()->count();
        $post->save();

        return response()->json([
            'is_saved' => $isSaved,
            'saves_count' => $post->saves
        ]);
    }

    public function getSavedPosts()
    {
        $userId = auth()->id();
        $savedPosts = SavedPost::with(['post.reactions'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($savedPost) use ($userId) {
                $post = $savedPost->post;
                $reactionCounts = $post->getReactionCounts();
                $userReaction = $post->getUserReaction($userId);
                
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'author' => $post->author,
                    'email' => $post->user ? $post->user->email : null,

                    'image_path' => $post->image_path,
                    'created_at' => $post->created_at,
                    'likes' => $reactionCounts['like'],
                    'hearts' => $reactionCounts['heart'],
                    'sad' => $reactionCounts['sad'],
                    'saves' => $post->saves ?? 0,
                    'is_saved' => true,
                    'user_reaction' => $userReaction,
                    'saved_at' => $savedPost->created_at
                ];
            });

        return response()->json($savedPosts);
    }

    public function getMyPosts()
    {
        $userId = auth()->id();
        $posts = FreedomWallPost::with(['savedByUsers', 'reactions'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($post) use ($userId) {
                $reactionCounts = $post->getReactionCounts();
                $userReaction = $post->getUserReaction($userId);
                
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'author' => $post->author,
                    'email' => $post->user ? $post->user->email : null,

                    'image_path' => $post->image_path,
                    'created_at' => $post->created_at,
                    'likes' => $reactionCounts['like'],
                    'hearts' => $reactionCounts['heart'],
                    'sad' => $reactionCounts['sad'],
                    'saves' => $post->saves ?? 0,
                    'is_saved' => $post->isSavedByUser($userId),
                    'user_reaction' => $userReaction
                ];
            });

        return response()->json($posts);
    }




    public function report(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|in:spam,harassment,hate_speech,nudity,self_harm,other',
            'custom_reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post = FreedomWallPost::findOrFail($id);

        // Check if this IP has already reported this post
        $existingReport = PostReport::where('post_id', $id)
            ->where('reporter_ip', $request->ip())
            ->first();

        if ($existingReport) {
            return response()->json(['message' => 'You have already reported this post'], 409);
        }

        $report = PostReport::create([
            'post_id' => $id,
            'reason' => $request->reason,
            'custom_reason' => $request->custom_reason,
            'reporter_ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Post reported successfully. Thank you for helping keep our community safe.',
            'report_id' => $report->id
        ], 201);
    }

    public function destroy($id)
    {
        $post = FreedomWallPost::findOrFail($id);
        
        // Only allow deletion if user owns the post or is admin
        if (auth()->check() && (auth()->id() === $post->user_id || auth()->user()->is_admin)) {
            // Delete associated image if exists
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            
            $post->delete();
            
            return response()->json(['message' => 'Post deleted successfully']);
        }
        
        return response()->json(['message' => 'Unauthorized'], 403);
    }
}
