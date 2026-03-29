<?php

namespace App\Repositories;
use App\Models\User;

class UserRepository {
    public function create(array $data): User {
        return User::create($data);
    }

    public function findById(string $id): ?User {
        return User::where('id', $id)->first();
    }

    public function findByEmail(string $email): ?User {
        return User::where('email', $email)->first();
    }
}
