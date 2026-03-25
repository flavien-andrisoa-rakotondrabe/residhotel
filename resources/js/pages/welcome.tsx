import { Head } from '@inertiajs/react';
import HeroSection from '@/components/landing/HeroSection';
import Navbar from '@/components/landing/Navbar';

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
        </>
    );
}
