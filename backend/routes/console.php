<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment('Forge 2 Kanban API');
})->purpose('Display an inspiring quote');
