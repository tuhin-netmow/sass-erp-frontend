
import { Helmet } from 'react-helmet-async';
import landingPageMetadata from '../config/metadata';
import { FeaturedModules } from "../components/features/FeaturedModules";
import HeroSection from "../components/features/HeroSection";
import { HomeCTA } from "../components/features/HomeCTA";
import { HomeFeatureHighlights } from "../components/features/HomeFeatureHighLights";
import HomeFeatures from "../components/features/HomeFeatures";
import { HomeIndustryUseCases } from "../components/features/HomeIndustryUseCases";
import HomeModules from "../components/features/HomeModules";
import HomePricing from "../components/features/HomePricing";
import { HomeStats } from "../components/features/HomeStats";
import { HomeTrustCredibility } from "../components/features/HomeTrustCredibility";
import { HowItWorks } from "../components/features/HowItWorks";
import ValueProposition from "../components/features/ValueProposition";



export default function LandingPage() {

 const metadata = landingPageMetadata.home;

 return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <link rel="canonical" href="https://kiraerp.com" />
      </Helmet>
      <HeroSection />
      <ValueProposition />
      <FeaturedModules />
      <HomeFeatures />
      <HomeModules />
      <HowItWorks />
      <HomeIndustryUseCases />
      <HomeFeatureHighlights />
      <HomeStats />
      <HomeTrustCredibility />
      <HomePricing />
      <HomeCTA />
    </>
    
  );

}