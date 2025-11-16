<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            // Check if registration is allowed
            $allowRegistration = Setting::getValue('allow_registration', 'true');
            if (filter_var($allowRegistration, FILTER_VALIDATE_BOOLEAN) === false) {
                return response()->json([
                    'message' => 'New registrations are currently disabled by the administrator.'
                ], 403);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'email'    => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            // Create user
            $user = User::create([
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'user', // Set default role
                'is_active' => true,  // Set default active status
            ]);

            // Create welcome notifications for new user
            try {
                \App\Models\Notification::createNotification(
                    $user->id,
                    'welcome',
                    'Welcome to Thrive360!',
                    'Welcome to Thrive360! We\'re excited to have you join our community. Start exploring challenges, events, and connect with others.',
                    [
                        'redirect_url' => url('/home')
                    ]
                );

                \App\Models\Notification::createNotification(
                    $user->id,
                    'getting_started',
                    'Getting Started Guide',
                    'Check out our getting started guide to learn about all the features available to you.',
                    [
                        'redirect_url' => url('/guide-detail')
                    ]
                );

                // Notify about available challenges
                $activeChallenges = \App\Models\Challenge::where('is_active', true)->count();
                if ($activeChallenges > 0) {
                    \App\Models\Notification::createNotification(
                        $user->id,
                        'challenge_available',
                        'Challenges Available',
                        "There are {$activeChallenges} active challenges waiting for you! Start your wellness journey today.",
                        [
                            'redirect_url' => url('/challenges')
                        ]
                    );
                }

                // Notify about upcoming events
                $upcomingEvents = \App\Models\Event::where('is_active', true)
                    ->where('start_date', '>', now())
                    ->count();
                if ($upcomingEvents > 0) {
                    \App\Models\Notification::createNotification(
                        $user->id,
                        'event_available',
                        'Upcoming Events',
                        "There are {$upcomingEvents} upcoming events you can join. Don't miss out!",
                        [
                            'redirect_url' => url('/home')
                        ]
                    );
                }

            } catch (\Exception $e) {
                \Log::error('Failed to create welcome notifications', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            // Create token for the user
            $token = $user->createToken('auth-token')->plainTextToken;

            \Log::info('User created successfully', ['user_id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'message' => 'User registered successfully!',
                'token'   => $token,
                'user'    => $user
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'email'    => 'required|string|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            // Attempt to authenticate
            if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
                $user = Auth::user();
                
                // Create token for the user
                $token = $user->createToken('auth-token')->plainTextToken;
                
                \Log::info('User logged in successfully', ['user_id' => $user->id, 'email' => $user->email]);

                return response()->json([
                    'message' => 'Login successful!',
                    'token'   => $token,
                    'user'    => $user
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

        } catch (\Exception $e) {
            \Log::error('Login failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Login error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeMeditation(Request $request) {
        // Validate and store meditation logic here
    }

    /**
     * Send a password reset link to the given email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 200);
        }

        return response()->json(['message' => __($status)], 400);
    }

    /**
     * Handle resetting the user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 200);
        }

        return response()->json(['message' => __($status)], 400);
    }
}
