import { LandingHeader } from "@/components/landing/landing-header"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustBar } from "@/components/landing/trust-bar"
import { FeaturedElection } from "@/components/landing/featured-election"
import { PrinciplesSection } from "@/components/landing/principles-section"
import { RecentActivity } from "@/components/landing/recent-activity"
import { LandingFooter } from "@/components/landing/landing-footer"
import { DDayBanner } from "@/components/landing/dday-banner"
import {
  getArchiveCounts,
  getElectionBySgId,
  getNextElection,
  getRecentPledgeItems,
} from "@/lib/queries"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

// ISR — 5분마다 재생성
export const revalidate = 300

const FEATURED_SG_ID = "0020220601" // Neon에 실데이터가 있는 선거 (제8회 지선)

async function loadLandingData() {
  const fallback = {
    counts: { elections: 0, candidacies: 0, pledges: 0, pledge_items: 0 },
    featured: {
      sgId: FEATURED_SG_ID,
      title: "제8회 전국동시지방선거",
      dateText: "2022-06-01",
      candidateCount: 0,
    },
    recent: [] as Awaited<ReturnType<typeof getRecentPledgeItems>>,
    next: null as Awaited<ReturnType<typeof getNextElection>>,
  }
  try {
    const [counts, featured, recent, next] = await Promise.all([
      getArchiveCounts(),
      getElectionBySgId(FEATURED_SG_ID),
      getRecentPledgeItems(8),
      getNextElection(),
    ])
    return {
      counts,
      featured: featured
        ? {
            sgId: featured.id,
            title: featured.title,
            dateText: featured.date,
            candidateCount: parseInt(
              (featured.candidateCount || "0").replace(/[^0-9]/g, "") || "0",
            ),
          }
        : fallback.featured,
      recent,
      next,
    }
  } catch (err) {
    console.error("[landing] Neon 조회 실패, fallback 사용:", err)
    return fallback
  }
}

export default async function HomePage() {
  const { counts, featured, recent, next } = await loadLandingData()
  const { dict } = await getLocaleAndDict()
  const t = (k: string) => translate(dict, k)

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background font-sans text-sm"
      >
        Skip to content
      </a>

      <LandingHeader />

      {next && (
        <DDayBanner
          electionName={next.name}
          electionDate={next.election_date}
          href={`/elections/${next.sg_id}`}
          labels={{
            until: t("dday.until"),
            today: t("dday.today"),
            days: t("dday.days"),
            hours: t("dday.hours"),
            minutes: t("dday.minutes"),
            seconds: t("dday.seconds"),
            cta: t("dday.cta"),
          }}
        />
      )}

      <main id="main-content" className="flex-1">
        <HeroSection />
        <TrustBar counts={counts} />
        <FeaturedElection featured={featured} />
        <PrinciplesSection />
        <RecentActivity items={recent} />
      </main>

      <LandingFooter />
    </div>
  )
}
