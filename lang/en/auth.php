<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
    */

    'failed' => 'These credentials do not match our records.',
    'password' => 'The provided password is incorrect.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',

    'register' => [
        'firstName_required' => 'FirstName required.',
        'lastName_required' => 'LastName required.',
        'tel_required' => 'Phone number required.',
        'tel_min' => 'Invalid phone number.',
        'email_required' => 'Email required.',
        'email_invalid' => 'Invalid email.',
        'email_exists' => 'Email already registered.',
        'password_required' => 'Password required.',
        'password_min' => 'Password must contain 6 characters.',
        'password_match' => "Password don't match.",
    ],

    'email'=>[
        'subject' => 'Welcome to :appName',
        'title' => 'Welcome :firstName :lastName !',
        'description' => "You just signed up to :appName. To ge started, click the button bellow to activate your account:",
        'button' => 'Activate my account',
        'if_error' => "If you didn't register, you can safely ignore this email."
    ]
];
