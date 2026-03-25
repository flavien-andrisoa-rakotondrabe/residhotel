import { Head } from '@inertiajs/react';
import FeaturedProperties from '@/components/landing/FeaturedProperties';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/landing/HeroSection';
import HostCTA from '@/components/landing/HostCTA';
import HowItWorks from '@/components/landing/HowItWorks';
import Navbar from '@/components/landing/Navbar';
import NearbyProperties from '@/components/landing/NearbyProperties';
import PopularDestinations from '@/components/landing/PopularDestinations';
import Testimonials from '@/components/landing/Testimonials';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <Navbar />
            <HeroSection />
            <NearbyProperties />
            <PopularDestinations />
            <FeaturedProperties />
            <HowItWorks />
            <Testimonials />
            <HostCTA />
            <Footer />
        </>
    );
}
