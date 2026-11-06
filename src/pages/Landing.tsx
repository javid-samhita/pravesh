import { useEffect } from 'react';
import { SiteHeader } from '../components/layout/SiteHeader';
import { SiteFooter } from '../components/layout/SiteFooter';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ConfigOverview } from '../components/landing/ConfigOverview';
import { Workflows } from '../components/landing/Workflows';
import { Architecture } from '../components/landing/Architecture';
import { QuickStart } from '../components/landing/QuickStart';
import { Repository } from '../components/landing/Repository';
import { Documentation } from '../components/landing/Documentation';

export default function Landing() {
  useEffect(() => {
    document.title = 'Pravesh, Build your provider onboarding portal. Your way.';
  }, []);
  return (
    <>
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow-pop">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Features />
        <HowItWorks />
        <ConfigOverview />
        <Workflows />
        <Architecture />
        <QuickStart />
        <Repository />
        <Documentation />
      </main>
      <SiteFooter />
    </>
  );
}
