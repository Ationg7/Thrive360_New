<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FreedomWallPost;
use App\Models\Challenge;
use App\Models\Meditation;
use App\Models\Blog;
use App\Models\PostReport;
use App\Models\Psychiatrist;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function __construct()
    {
        // Middleware will be applied in routes
    }

    // Admin Registration
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required|string|min:8',
                'role' => 'required|in:admin',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role' => 'admin',
                'is_active' => true,
            ]);

            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Admin registered successfully',
                'token' => $token,
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Admin registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin Login
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            if (!auth()->attempt($request->only('email', 'password'))) {
                return response()->json(['message' => 'Invalid email or password'], 401);
            }

            $user = auth()->user();

            // Check if user is admin
            if (!$user->isAdmin()) {
                auth()->logout();
                return response()->json(['message' => 'Admin access required. This account does not have admin privileges.'], 403);
            }

            // Check if user is active
            if (!$user->is_active) {
                auth()->logout();
                return response()->json(['message' => 'Account is deactivated. Please contact administrator.'], 403);
            }

            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Dashboard Statistics
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_posts' => FreedomWallPost::count(),
            'total_challenges' => Challenge::count(),
            'guest_posts' => FreedomWallPost::where('is_guest_post', true)->count(),
            'user_posts' => FreedomWallPost::where('is_guest_post', false)->count(),
        ];

        return response()->json($stats);
    }

    // User Management
    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:user,admin',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $user->update($request->only(['name', 'email', 'role', 'is_active']));

        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->isAdmin() && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the last admin'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    // Content Management
    public function getPosts()
    {
        $posts = FreedomWallPost::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    public function deletePost($id)
    {
        $post = FreedomWallPost::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    public function getChallenges()
    {
        $challenges = Challenge::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($challenges);
    }

    public function deleteChallenge($id)
    {
        $challenge = Challenge::findOrFail($id);
        $challenge->delete();

        return response()->json(['message' => 'Challenge deleted successfully']);
    }

    // Analytics
    public function getAnalytics()
    {
        $analytics = [
            'posts_per_day' => FreedomWallPost::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'challenges_per_day' => Challenge::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'user_registrations' => User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];

        return response()->json($analytics);
    }

    // Meditation Management
    public function getMeditations()
    {
        $meditations = Meditation::orderBy('created_at', 'desc')->get();
        return response()->json($meditations);
    }

    public function storeMeditation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'nullable|string',
            'category' => 'required|in:guided,breathing,mindfulness,sleep',
            'image_file' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $meditation = new Meditation($request->only([
            'title', 'description', 'duration', 'category'
        ]));

        if ($request->hasFile('image_file')) {
            $meditation->image_url = $request->file('image_file')->store('meditations/images', 'public');
        }

        $meditation->save();

       // Notify all users
$users = User::all();
foreach ($users as $user) {
    Notification::createNotification(
        $user->id,
        'meditation',
        'New Meditation Available',
        "A new meditation '{$meditation->title}' is now available.",
        [
            'meditation_id' => $meditation->id,
            'redirect_url' => url("/meditations/{$meditation->id}") // Add redirect URL
        ]
    );
}

        return response()->json($meditation, 201);
    }

    public function deleteMeditation($id)
    {
        $meditation = Meditation::findOrFail($id);

        if ($meditation->image_url) {
            Storage::disk('public')->delete($meditation->image_url);
        }

        $meditation->delete();

        return response()->json(['message' => 'Meditation deleted successfully']);
    }

    // Blog Management
    public function getBlogs()
    {
        $blogs = Blog::orderBy('created_at', 'desc')->get();
        return response()->json($blogs);
    }

    public function storeBlog(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string',
            'excerpt' => 'nullable|string',
            'tags' => 'nullable|string',
            'image_file' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $blogData = $request->only(['title', 'content', 'category', 'excerpt']);

        if ($request->tags) {
            $blogData['tags'] = array_map('trim', explode(',', $request->tags));
        }

        $blog = new Blog($blogData);

        if ($request->hasFile('image_file')) {
            $blog->image_url = $request->file('image_file')->store('blogs/images', 'public');
        }

        $blog->save();

        // Notify all users
$users = User::where('id', '!=', auth()->id())->get();
foreach ($users as $user) {
    Notification::createNotification(
        $user->id,
        'blog',
        'New Blog Uploaded',
        "A new blog titled '{$blog->title}' has been uploaded.",
        [
            'blog_id' => $blog->id,
            'redirect_url' => url("/blogs/{$blog->id}") // Add redirect URL
        ]
    );
}


        return response()->json($blog, 201);
    }

    public function deleteBlog($id)
    {
        $blog = Blog::findOrFail($id);

        if ($blog->image_url) {
            Storage::disk('public')->delete($blog->image_url);
        }

        $blog->delete();

        return response()->json(['message' => 'Blog deleted successfully']);
    }

    // Post Reports Management
    public function getReports()
    {
        $reports = PostReport::with(['post', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reports);
    }

    public function updateReportStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,reviewed,resolved,dismissed',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = PostReport::findOrFail($id);

        $report->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Report status updated successfully',
            'report' => $report->load(['post', 'reviewer'])
        ]);
    }

    public function deleteReportedPost(Request $request, $reportId)
    {
        $report = PostReport::findOrFail($reportId);
        $post = $report->post;

        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }

        $post->delete();

        $report->update([
            'status' => 'resolved',
            'admin_notes' => 'Post deleted by admin due to violation',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Reported post deleted successfully']);
    }

    public function getReportsStats()
    {
        $stats = [
            'total_reports' => PostReport::count(),
            'pending_reports' => PostReport::where('status', 'pending')->count(),
            'reviewed_reports' => PostReport::where('status', 'reviewed')->count(),
            'resolved_reports' => PostReport::where('status', 'resolved')->count(),
            'dismissed_reports' => PostReport::where('status', 'dismissed')->count(),
            'reports_by_reason' => PostReport::selectRaw('reason, COUNT(*) as count')
                ->groupBy('reason')
                ->get()
                ->pluck('count', 'reason'),
        ];

        return response()->json($stats);
    }

    // Psychiatrist Management
    public function getPsychiatrists()
    {
        $psychiatrists = Psychiatrist::orderBy('created_at', 'desc')->get();
        return response()->json($psychiatrists);
    }

    public function getActivePsychiatrists()
    {
        $psychiatrists = Psychiatrist::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($psychiatrists);
    }

    public function storePsychiatrist(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'consultation_fee' => 'nullable|numeric|min:0',
            'image_file' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $psychiatristData = $request->only([
            'name', 'specialization', 'phone', 'email', 'address', 
            'description', 'consultation_fee', 'is_active'
        ]);

        $psychiatristData['availability'] = Psychiatrist::getDefaultAvailability();

        $psychiatrist = new Psychiatrist($psychiatristData);

        if ($request->hasFile('image_file')) {
            $psychiatrist->image_url = $request->file('image_file')->store('psychiatrists/images', 'public');
        }

        $psychiatrist->save();

        return response()->json($psychiatrist, 201);
    }

    public function updatePsychiatrist(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'consultation_fee' => 'nullable|numeric|min:0',
            'image_file' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $psychiatrist = Psychiatrist::findOrFail($id);

        $psychiatristData = $request->only([
            'name', 'specialization', 'phone', 'email', 'address', 
            'description', 'consultation_fee', 'is_active'
        ]);

        if ($request->hasFile('image_file')) {
            if ($psychiatrist->image_url) {
                Storage::disk('public')->delete($psychiatrist->image_url);
            }
            $psychiatristData['image_url'] = $request->file('image_file')->store('psychiatrists/images', 'public');
        }

        $psychiatrist->update($psychiatristData);

        return response()->json($psychiatrist);
    }

    public function deletePsychiatrist($id)
    {
        $psychiatrist = Psychiatrist::findOrFail($id);

        if ($psychiatrist->image_url) {
            Storage::disk('public')->delete($psychiatrist->image_url);
        }

        $psychiatrist->delete();

        return response()->json(['message' => 'Psychiatrist deleted successfully']);
    }

    public function updatePsychiatristAvailability(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'availability' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $psychiatrist = Psychiatrist::findOrFail($id);
        $psychiatrist->update(['availability' => $request->availability]);

        return response()->json([
            'message' => 'Availability updated successfully',
            'psychiatrist' => $psychiatrist
        ]);
    }
}
