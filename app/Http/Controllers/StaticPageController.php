<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class StaticPageController extends Controller
{
    // About page
    public function showAbout() {
        return Inertia::render('about');
    }

    // How It Works page
    public function showHowItWorks() {
        return Inertia::render('how-it-works');
    }

    // Blog page
    public function showBlog() {
        return Inertia::render('blog');
    }

    // Careers page
    public function showCareers() {
        return Inertia::render('careers');
    }

    // Destinations page
    public function showDestinations() {
        return Inertia::render('destinations');
    }

    // Offers page
    public function showOffers() {
        return Inertia::render('offers');
    }

    // Insurance page
    public function showInsurance() {
        return Inertia::render('insurance');
    }

    // Help page
    public function showHelp() {
        return Inertia::render('help');
    }

    // Host Help page
    public function showHostHelp() {
        return Inertia::render('host-help');
    }

    // Certification page
    public function showCertification() {
        return Inertia::render('certification');
    }

    // Legal page
    public function showLegal() {
        return Inertia::render('legal');
    }
}
