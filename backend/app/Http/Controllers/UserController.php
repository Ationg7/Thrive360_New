<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\UserDevice;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function getAllUsers()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . auth()->id(),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $user->update($request->only(['name', 'email']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
            'new_password_confirmation' => 'required|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();

        // Verify current password
        if (!password_verify($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        // Update password
        $user->update([
            'password' => bcrypt($request->new_password)
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function updateAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar_url' => 'required|string|url'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $user->update(['avatar_url' => $request->avatar_url]);

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar_url' => $user->avatar_url
        ]);
    }

    public function setProfileCover(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_cover_url' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $user->update(['profile_cover_url' => $request->profile_cover_url]);

        return response()->json([
            'message' => 'Profile cover updated successfully',
            'profile_cover_url' => $user->profile_cover_url
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120' // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();

        // Delete old avatar if exists
        if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
            Storage::disk('public')->delete($user->avatar_url);
        }

        // Store new avatar
        $avatarPath = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_url' => $avatarPath]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => Storage::url($avatarPath)
        ]);
    }

    public function removeAvatar(Request $request)
    {
        $user = auth()->user();

        // Delete avatar file if exists
        if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
            Storage::disk('public')->delete($user->avatar_url);
        }

        // Remove avatar URL from user
        $user->update(['avatar_url' => null]);

        return response()->json(['message' => 'Avatar removed successfully']);
    }

    public function getNotificationSettings(Request $request)
    {
        $user = auth()->user();
        
        // Return default notification settings for now
        // In a real app, you'd store these in a separate table
        return response()->json([
            'email_notifications' => true,
            'push_notifications' => true,
            'event_reminders' => true,
            'challenge_updates' => true,
            'post_reactions' => true
        ]);
    }

    public function updateNotificationSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_notifications' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'event_reminders' => 'sometimes|boolean',
            'challenge_updates' => 'sometimes|boolean',
            'post_reactions' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // In a real app, you'd store these in a separate table
        // For now, just return success
        return response()->json(['message' => 'Notification settings updated successfully']);
    }

    public function getPrivacySettings(Request $request)
    {
        $user = auth()->user();
        
        // Return default privacy settings for now
        return response()->json([
            'profile_visibility' => 'public',
            'show_email' => false,
            'allow_messages' => true,
            'show_activity' => true
        ]);
    }

    public function updatePrivacySettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_visibility' => 'sometimes|in:public,friends,private',
            'show_email' => 'sometimes|boolean',
            'allow_messages' => 'sometimes|boolean',
            'show_activity' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // In a real app, you'd store these in a separate table
        return response()->json(['message' => 'Privacy settings updated successfully']);
    }
    
    /**
     * Store or update an FCM token for the authenticated user.
     */
    public function saveFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
            'device_type' => 'nullable|string|max:50',
            'device_name' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        $device = UserDevice::updateOrCreate(
            [
                'user_id' => $user->id,
                'fcm_token' => $request->fcm_token,
            ],
            [
                'device_type' => $request->device_type,
                'device_name' => $request->device_name,
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'FCM token saved successfully',
            'device' => $device,
        ]);
    }

    /**
     * Remove an FCM token for the authenticated user (e.g., on logout).
     */
    public function deleteFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $user = $request->user();

        UserDevice::where('user_id', $user->id)
            ->where('fcm_token', $request->fcm_token)
            ->delete();

        return response()->json([
            'message' => 'FCM token deleted successfully',
        ]);
    }


}