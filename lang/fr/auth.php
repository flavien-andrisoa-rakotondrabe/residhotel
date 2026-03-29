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

    'failed' => 'Vérifier les critères.',
    'password' => 'Mot de passe incorrect.',
    'throttle' => 'Veuillez réessayez dans :seconds secondes.',

    'register' => [
        'firstName_required' => 'Prénom requis.',
        'lastName_required' => 'Nom requis.',
        'tel_required' => 'Numéro de téléphone requis.',
        'tel_min' => 'Numéro de téléphone invalide.',
        'email_required' => 'Adresse email requise.',
        'email_invalid' => 'Adresse email invalide.',
        'email_exists' => 'Adresse email déjà enregistrée.',
        'password_required' => 'Mot de passe requis.',
        'password_min' => 'Le mot de passe doit contenir au moins 6 caractères.',
        'password_match' => 'Les mots de passe ne correspondent pas.',
    ],

    'email'=>[
        'subject' => 'Bienvenue dans :appName',
        'title' => 'Bienvenue :lastName :firstName !',
        'description' => "Votre compte a bien été créé sur :appName. Pour commencer, veuillez cliquer sur le bouton suivant afin d'activer votre compte :",
        'button' => 'Activer mon compte',
        'if_error' => "Si vous ne vous êtes pas inscrit, veuillez juste ignorer ce mail."
    ]
];
