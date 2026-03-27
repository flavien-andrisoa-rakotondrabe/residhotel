<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail {
    use HasUuid, Notifiable;

    protected $fillable = ['firstName', 'lastName', 'tel', 'email', 'password', 'role'];
    protected $casts = ['email_verified_at' => 'datetime', 'password' => 'hashed'];

    public function sendPasswordResetNotification($token): void {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }
}
