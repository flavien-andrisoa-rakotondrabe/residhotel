<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * Le token de réinitialisation
     */
    public string $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage {
        $url = route('password.reset', ['token' => $this->token, 'email' => $notifiable->email]);

        return (new MailMessage)
            ->subject('Réinitialisation de mot de passe')
            ->greeting('Bonjour ' . $notifiable->firstName)
            ->line('Demande de changement de mot de passe reçue.')
            ->action('Changer mon mot de passe', $url);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
