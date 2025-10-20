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
use App\Models\PasswordResetCode;
use App\Models\ProfileCover;    
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
            'category' => 'required|in:Meditation,Stretching,Workout',
            'image_file' => 'nullable|image|max:5000',
            'tutorial_steps' => 'nullable|string',
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

        // Handle tutorial steps
        if ($request->has('tutorial_steps')) {
            $tutorialSteps = json_decode($request->tutorial_steps, true);
            $tutorialData = [];
            
            foreach ($tutorialSteps as $index => $step) {
                $stepData = [
                    'step' => $step['step'],
                    'title' => $step['title'],
                    'description' => $step['description'],
                    'image_url' => null
                ];
                
                // Handle tutorial step images
                $imageKey = "tutorial_step_" . ($index + 1) . "_image";
                if ($request->hasFile($imageKey)) {
                    $stepData['image_url'] = $request->file($imageKey)->store('meditations/tutorial-steps', 'public');
                }
                
                $tutorialData[] = $stepData;
            }
            
            $meditation->tutorial_steps = json_encode($tutorialData);
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

    public function updateMeditation(Request $request, $id)
    {
        $meditation = Meditation::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'duration' => 'nullable|string',
            'category' => 'sometimes|string',
            'tutorial_steps' => 'nullable|string',
            'image_file' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $meditation->update($request->only([
            'title', 'description', 'duration', 'category', 'tutorial_steps'
        ]));

        if ($request->hasFile('image_file')) {
            // Delete old image if exists
            if ($meditation->image_url) {
                Storage::disk('public')->delete($meditation->image_url);
            }
            $meditation->image_url = $request->file('image_file')->store('meditations', 'public');
            $meditation->save();
        }

        // Refresh the meditation to get updated data
        $meditation = $meditation->fresh();

        return response()->json($meditation);
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

    public function updateBlog(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'category' => 'sometimes|string',
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

        $blog->update($blogData);

        if ($request->hasFile('image_file')) {
            // Delete old image if exists
            if ($blog->image_url) {
                Storage::disk('public')->delete($blog->image_url);
            }
            $blog->image_url = $request->file('image_file')->store('blogs/images', 'public');
            $blog->save();
        }

        // Refresh the blog to get updated data
        $blog = $blog->fresh();

        return response()->json($blog);
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

    public function sendWarningToUser(Request $request, $reportId)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = PostReport::findOrFail($reportId);
        $post = $report->post;

        // Create a notification for the user who posted
        if ($post && $post->user_id) {
            \App\Models\Notification::createNotification(
                $post->user_id,
                'warning',
                'Content Warning',
                $request->message,
                [
                    'report_id' => $report->id,
                    'post_id' => $post->id,
                    'redirect_url' => url("/freedom-wall")
                ]
            );
        }

        $report->update([
            'status' => 'resolved',
            'admin_notes' => 'Warning sent to user: ' . $request->message,
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Warning sent to user successfully']);
    }

    public function restrictUser(Request $request, $reportId)
    {
        $validator = Validator::make($request->all(), [
            'days' => 'required|integer|min:1|max:365',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = PostReport::findOrFail($reportId);
        $post = $report->post;

        if ($post && $post->user_id) {
            $user = \App\Models\User::find($post->user_id);
            
            // Set restriction end date
            $restrictionEndDate = now()->addDays($request->days);
            $user->update([
                'restricted_until' => $restrictionEndDate,
                'restriction_reason' => $request->message
            ]);

            // Create a notification for the user
            \App\Models\Notification::createNotification(
                $post->user_id,
                'restriction',
                'Account Restriction',
                "Your account has been restricted for {$request->days} days. Reason: {$request->message}",
                [
                    'report_id' => $report->id,
                    'post_id' => $post->id,
                    'restriction_days' => $request->days,
                    'restriction_end' => $restrictionEndDate->toISOString(),
                    'redirect_url' => url("/profile")
                ]
            );
        }

        $report->update([
            'status' => 'resolved',
            'admin_notes' => "User restricted for {$request->days} days: " . $request->message,
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'User restricted successfully']);
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

    // Password Reset Code Management
    public function getPasswordResetRequests()
    {
        try {
            $requests = PasswordResetCode::where('is_used', false)
                ->where('expires_at', '>', now())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            \Log::error('Error fetching password reset requests: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch requests'], 500);
        }
    }

    public function generatePasswordResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $email = $request->email;
        
        // Check if user exists
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Check if there's a pending request
        $pendingRequest = PasswordResetCode::where('email', $email)
            ->where('code', 'PENDING')
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($pendingRequest) {
            // Update the pending request with actual code
            $pendingRequest->update([
                'code' => PasswordResetCode::generateCode(),
                'expires_at' => now()->addHours(1) // Reset to 1 hour from now
            ]);
            $resetCode = $pendingRequest;
        } else {
            // Create new reset code
            $resetCode = PasswordResetCode::createForEmail($email);
        }

        return response()->json([
            'message' => 'Password reset code generated successfully',
            'code' => $resetCode->code,
            'email' => $email,
            'expires_at' => $resetCode->expires_at
        ]);
    }

    public function verifyPasswordResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $isValid = PasswordResetCode::isValidCode($request->email, $request->code);

        if ($isValid) {
            return response()->json(['message' => 'Code verified successfully']);
        }

        return response()->json(['error' => 'Invalid or expired code'], 400);
    }

    public function resetPassword(Request $request)
    {
        \Log::info('Password reset request received', [
            'request_data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            \Log::error('Password reset validation failed', [
                'errors' => $validator->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify the code first (without marking as used)
        \Log::info('Checking code validity', [
            'email' => $request->email,
            'code' => $request->code
        ]);
        
        $isValid = PasswordResetCode::isValidCode($request->email, $request->code);
        
        \Log::info('Code validity result', [
            'is_valid' => $isValid,
            'email' => $request->email,
            'code' => $request->code
        ]);
        
        if (!$isValid) {
            \Log::error('Password reset code verification failed', [
                'email' => $request->email,
                'code' => $request->code,
                'request_data' => $request->all()
            ]);
            return response()->json(['error' => 'Invalid or expired code'], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->password = bcrypt($request->password);
        $user->save();

        // Mark the code as used after successful password reset
        $resetCode = PasswordResetCode::where('email', $request->email)
            ->where('code', $request->code)
            ->where('is_used', false)
            ->first();
        
        if ($resetCode) {
            $resetCode->update([
                'is_used' => true,
                'used_at' => now()
            ]);
        }

        return response()->json(['message' => 'Password reset successfully']);
    }

    public function sendNotificationToAllUsers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'data' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $users = User::where('role', 'user')->where('is_active', true)->get();
            $sentCount = 0;

            foreach ($users as $user) {
                Notification::createNotification(
                    $user->id,
                    $request->type,
                    $request->title,
                    $request->message,
                    $request->data
                );
                $sentCount++;
            }

            return response()->json([
                'message' => "Notification sent to {$sentCount} users successfully",
                'sent_count' => $sentCount
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send notification to all users', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to send notifications'], 500);
        }
    }

    public function ensureAllUsersHaveNotifications()
    {
        try {
            $users = User::where('role', 'user')->where('is_active', true)->get();
            $updatedCount = 0;

            foreach ($users as $user) {
                // Check if user has any notifications
                $hasNotifications = $user->notifications()->exists();
                
                if (!$hasNotifications) {
                    // Create welcome notifications for users who don't have any
                    Notification::createNotification(
                        $user->id,
                        'welcome',
                        'Welcome to Thrive360!',
                        'Welcome to Thrive360! We\'re excited to have you join our community. Start exploring challenges, events, and connect with others.',
                        [
                            'redirect_url' => url('/home')
                        ]
                    );

                    // Notify about available challenges
                    $activeChallenges = \App\Models\Challenge::where('is_active', true)->count();
                    if ($activeChallenges > 0) {
                        Notification::createNotification(
                            $user->id,
                            'challenge_available',
                            'Challenges Available',
                            "There are {$activeChallenges} active challenges waiting for you! Start your wellness journey today.",
                            [
                                'redirect_url' => url('/challenges')
                            ]
                        );
                    }

                    $updatedCount++;
                }
            }

            return response()->json([
                'message' => "Ensured {$updatedCount} users have notifications",
                'updated_count' => $updatedCount,
                'total_users' => $users->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to ensure all users have notifications', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to ensure notifications'], 500);
        }
    }

    // --- Profile Cover Management (storage/public/profile-covers) ---
    public function uploadProfileCover(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = \Illuminate\Support\Facades\Storage::disk('public')->putFile('profile-covers', $request->file('cover'));
        $url = \Illuminate\Support\Facades\Storage::url($path);

        $record = \App\Models\ProfileCover::create([
            'path' => $path,
            'url' => $url,
            'uploaded_by' => auth()->id()
        ]);

        // Notify all users about the new profile cover
        $users = User::all();
        foreach ($users as $user) {
            Notification::createNotification(
                $user->id,
                'profile_cover',
                'New Profile Cover Available',
                "A new profile cover has been uploaded and is now available for use!",
                [
                    'profile_cover_id' => $record->id,
                    'redirect_url' => url("/profile-covers")
                ]
            );
        }

        return response()->json($record, 201);
    }

    public function getProfileCovers()
    {
        $covers = \App\Models\ProfileCover::orderBy('created_at', 'desc')->get(['id','path','url','created_at']);
        return response()->json($covers);
    }

    public function deleteProfileCover($id)
    {
        $cover = \App\Models\ProfileCover::findOrFail($id);
        if ($cover->path && \Illuminate\Support\Facades\Storage::disk('public')->exists($cover->path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($cover->path);
        }
        $cover->delete();
        return response()->json(['message' => 'Cover deleted successfully']);
    }

    public function requestPasswordResetCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $email = $request->email;
            
            // Check if user exists
            $user = User::where('email', $email)->first();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Check if there's already a pending request
            if (PasswordResetCode::hasAnyPendingRequest($email)) {
                return response()->json(['message' => 'Password reset request already pending. Please wait for admin to generate code.']);
            }

            // Create a pending request (without code yet)
            $resetRequest = PasswordResetCode::create([
                'email' => $email,
                'code' => 'PENDING', // Special status for pending requests
                'expires_at' => now()->addHours(24), // Give admin 24 hours to respond
            ]);

            // Send email notification to all admins
            try {
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    Notification::createNotification(
                        $admin->id,
                        'password_reset_request',
                        'Password Reset Request',
                        "User {$user->name} ({$email}) has requested a password reset code.",
                        [
                            'user_email' => $email,
                            'user_name' => $user->name,
                            'request_id' => $resetRequest->id,
                            'redirect_url' => url('/admin/password-reset')
                        ]
                    );
                }
            } catch (\Exception $e) {
                // Log the error but don't fail the request
                \Log::error('Failed to create notification: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Password reset request sent to admin. You will receive the code shortly.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Password reset request error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    public function checkPasswordResetRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $hasRequest = PasswordResetCode::hasPendingRequest($request->email);
        $latestCode = null;

        if ($hasRequest) {
            $latestCode = PasswordResetCode::getLatestPendingCode($request->email);
        }

        return response()->json([
            'has_pending_request' => $hasRequest,
            'code' => $latestCode ? $latestCode->code : null,
            'expires_at' => $latestCode ? $latestCode->expires_at : null
        ]);
    }
}
