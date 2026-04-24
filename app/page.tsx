import { LandingHeader } from "@/components/landing/landing-header"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustBar } from "@/components/landing/trust-bar"
import { FeaturedElection } from "@/components/landing/featured-election"
import { PrinciplesSection } from "@/components/landing/principles-section"
import { RecentActivity } from "@/components/landing/recent-activity"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background font-sans text-sm"
      >
        본문으로 건너뛰기
      </a>
      
      <LandingHeader />
      
      <main id="main-content" className="flex-1">
        <HeroSection />
        <TrustBar />
        <FeaturedElection />
        <PrinciplesSection />
        <RecentActivity />
      </main>
      
      <LandingFooter />
    </div>
  )
}
