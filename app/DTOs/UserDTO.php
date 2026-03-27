<?php

namespace App\DTOs;

readonly class UserDTO {
    public function __construct(
        public string $firstName, public string $lastName,
        public string $email, public string $tel,
        public string $password, public string $role
    ) {}
}
