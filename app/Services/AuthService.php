<?php

namespace App\Services;

use App\DTOs\UserDTO;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class AuthService {
    public function __construct(protected UserRepository $userRepository) {}

    public function register(UserDTO $dto) {
        return $this->userRepository->create((array) $dto);
    }
}
