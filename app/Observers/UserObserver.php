<?php

namespace App\Observers;
use App\Models\User;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

class UserObserver {
    public function updated(User $user) {
        if ($user->wasChanged('email_verified_at') && $user->email_verified_at !== null) {
            Mail::to($user->email)->send(new WelcomeMail($user));
        }
    }
}
