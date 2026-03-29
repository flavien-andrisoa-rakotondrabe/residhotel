<?php

namespace App\DTOs;

use App\Http\Requests\RegisterRequest;

readonly class UserDTO {
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $email,
        public string $tel,
        public string $password,
        public string $role
    ) {}

    public static function fromRequest(RegisterRequest $request): self {
        return new self(
            firstName: $request->validated('firstName'),
            lastName:  $request->validated('lastName'),
            email:     $request->validated('email'),
            tel:       $request->validated('tel'),
            password:  $request->validated('password'),
            role:      $request->validated('role')
        );
    }
}
