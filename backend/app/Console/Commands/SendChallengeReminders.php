<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserChallengeProgress;
use App\Models\Challenge;
use App\Models\Notification;
use Carbon\Carbon;

class SendChallengeReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'thrive360:send-challenge-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send push notifications reminding users about joined but not yet completed challenges, especially those near or past end date.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();

        // Consider challenges ending within next 2 days or ended in last 2 days
        $upcoming = $now->copy()->addDays(2);
        $recentPast = $now->copy()->subDays(2);

        $progressItems = UserChallengeProgress::with('challenge')
            ->where('status', '!=', 'Completed')
            ->whereHas('challenge', function ($q) use ($recentPast, $upcoming) {
                $q->whereNotNull('end_date')
                    ->whereBetween('end_date', [$recentPast->toDateString(), $upcoming->toDateString()])
                    ->where('is_active', true);
            })
            ->get();

        $reminderCount = 0;

        foreach ($progressItems as $progress) {
            /** @var Challenge|null $challenge */
            $challenge = $progress->challenge;
            if (!$challenge) {
                continue;
            }

            $endDate = $challenge->end_date ? Carbon::parse($challenge->end_date) : null;
            $daysLeft = $endDate ? $now->diffInDays($endDate, false) : null;

            // Build a user-friendly message depending on how close/past the end date is
            if ($daysLeft !== null && $daysLeft >= 0) {
                $body = "You have {$progress->progress_percentage}% progress in '{$challenge->title}'. Keep going! "
                    . "You have {$daysLeft} day(s) left before it ends.";
            } else {
                $body = "Your challenge '{$challenge->title}' is past its end date, "
                    . "but you can still complete it. You're at {$progress->progress_percentage}%!";
            }

            Notification::createNotification(
                $progress->user_id,
                'challenge_reminder',
                'Challenge Reminder',
                $body,
                [
                    'challenge_id' => $challenge->id,
                    'progress_percentage' => $progress->progress_percentage,
                    'redirect_url' => url('/challenges'),
                ]
            );

            $reminderCount++;
        }

        $this->info("Sent {$reminderCount} challenge reminder notifications.");

        return Command::SUCCESS;
    }
}



