<?php

use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FreedomWallController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminChallengeController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/users', [UserController::class, 'getAllUsers']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Password reset routes
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Freedom Wall routes
Route::get('/freedom-wall/posts', [FreedomWallController::class, 'index']);
Route::post('/freedom-wall/posts', [FreedomWallController::class, 'store']);
Route::post('/freedom-wall/posts/{id}/report', [FreedomWallController::class, 'report']);

// Challenge routes (public)
Route::get('/challenges', [ChallengeController::class, 'index']);
Route::get('/challenges/{id}', [ChallengeController::class, 'show'])->whereNumber('id');

// Event routes (public)
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Freedom Wall protected routes
    Route::post('/freedom-wall/posts/auth', [FreedomWallController::class, 'store']);
    Route::post('/freedom-wall/posts/{postId}/react', [FreedomWallController::class, 'react']);
    Route::post('/freedom-wall/posts/{post}/save', [FreedomWallController::class, 'save']);
    Route::get('/freedom-wall/saved-posts', [FreedomWallController::class, 'getSavedPosts']);
    Route::get('/freedom-wall/my-posts', [FreedomWallController::class, 'getMyPosts']);
    Route::delete('/freedom-wall/posts/{id}', [FreedomWallController::class, 'destroy']);
    
    // Challenge protected routes
    Route::post('/challenges', [ChallengeController::class, 'store']);
    Route::put('/challenges/{id}', [ChallengeController::class, 'update'])->whereNumber('id');
    Route::delete('/challenges/{id}', [ChallengeController::class, 'destroy'])->whereNumber('id');
    Route::post('/challenges/{id}/join', [ChallengeController::class, 'join'])->whereNumber('id');
    Route::post('/challenges/{id}/progress', [ChallengeController::class, 'updateProgress'])->whereNumber('id');
    Route::get('/challenges/{id}/progress', [ChallengeController::class, 'getUserProgress'])->whereNumber('id');
    Route::get('/challenges/history', [ChallengeController::class, 'getUserHistory']);
    
    // Todo routes
    Route::apiResource('todos', TodoController::class);
    Route::post('/todos/{id}/toggle', [TodoController::class, 'toggleComplete']);
    
    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Event protected routes
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::post('/events/{id}/join', [EventController::class, 'join']);
    Route::post('/events/{id}/leave', [EventController::class, 'leave']);
    Route::get('/events/suggestions', [EventController::class, 'getSuggestions']);

    // Admin routes (protected with admin middleware)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/posts', [AdminController::class, 'getPosts']);
        Route::delete('/posts/{id}', [AdminController::class, 'deletePost']);
        Route::get('/analytics', [AdminController::class, 'getAnalytics']);
        
        // Meditation routes
        Route::get('/meditation', [AdminController::class, 'getMeditations']);
        Route::post('/meditation', [AdminController::class, 'storeMeditation']);
        Route::delete('/meditation/{id}', [AdminController::class, 'deleteMeditation']);
        
        // Blog routes
        Route::get('/blogs', [AdminController::class, 'getBlogs']);
        Route::post('/blogs', [AdminController::class, 'storeBlog']);
        Route::delete('/blogs/{id}', [AdminController::class, 'deleteBlog']);

        // Report routes
        Route::get('/reports', [AdminController::class, 'getReports']);
        Route::get('/reports/stats', [AdminController::class, 'getReportsStats']);
        Route::put('/reports/{id}/status', [AdminController::class, 'updateReportStatus']);
        Route::delete('/reports/{id}/post', [AdminController::class, 'deleteReportedPost']);

        // Psychiatrist routes
        Route::get('/psychiatrists', [AdminController::class, 'getPsychiatrists']);
        Route::post('/psychiatrists', [AdminController::class, 'storePsychiatrist']);
        Route::put('/psychiatrists/{id}', [AdminController::class, 'updatePsychiatrist']);
        Route::delete('/psychiatrists/{id}', [AdminController::class, 'deletePsychiatrist']);
        Route::put('/psychiatrists/{id}/availability', [AdminController::class, 'updatePsychiatristAvailability']);

        // --- Admin Challenge Routes ---
        Route::get('/challenges', [AdminChallengeController::class, 'index']);
        Route::post('/challenges', [AdminChallengeController::class, 'store']);
        Route::delete('/challenges/{id}', [AdminChallengeController::class, 'destroy']);

        // --- Admin Event Routes ---
        Route::get('/events', [EventController::class, 'index']);
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);
    });
});

// Admin authentication routes (public)
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminController::class, 'login']);
    Route::post('/register', [AdminController::class, 'register']);

    // Public content endpoints for frontend (no admin middleware)
    Route::get('/blogs', [AdminController::class, 'getBlogs']);
    Route::get('/meditation', [AdminController::class, 'getMeditations']);
    Route::get('/psychiatrists/active', [AdminController::class, 'getActivePsychiatrists']);
});

// Test route
Route::get('/test-db', function () {
    try {
        $users = \App\Models\User::all();
        return response()->json([
            'message' => 'Database connection successful',
            'user_count' => $users->count(),
            'users' => $users
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

