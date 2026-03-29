<?php

namespace App\Observers;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;

class UserObserver {
    public function created(User $user): void {
        $user->notify(new VerifyEmailNotification());
    }

    // public function updated(User $user) {
    //     if ($user->wasChanged('email_verified_at') && $user->email_verified_at !== null) {
    //         Mail::to($user->email)->send(new WelcomeMail($user));
    //     }
    // }
}
