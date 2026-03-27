<?php

namespace App\Services;
use App\Models\User;
use App\DTOs\UserDTO;

class AuthService {
    public function register(UserDTO $dto): User {
        return User::create((array) $dto);
    }
}
