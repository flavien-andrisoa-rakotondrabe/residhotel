<?php

namespace App\Traits;
use Illuminate\Support\Str;

trait HasUuid {
    protected static function bootHasUuid() {
        static::creating(fn ($model) => $model->id = $model->id ?? (string) Str::uuid());
    }
    public function getIncrementing() { return false; }
    public function getKeyType() { return 'string'; }
}
