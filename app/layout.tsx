import type { Metadata, Viewport } from 'next'
import { Noto_Serif_KR, Noto_Sans_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { getLocaleAndDict } from '@/lib/i18n/server'
import { localeHtmlLang } from '@/lib/i18n/config'
import { I18nProvider } from '@/lib/i18n/context'
import './globals.css'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-pretendard',
  display: 'swap',
})

const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getLocaleAndDict()
  return {
    title: `${dict.meta.site_name} — ${dict.meta.tagline}`,
    description: dict.meta.description,
    generator: 'v0.app',
    keywords: ['선거', '공약', '후보자', 'election', 'pledges', 'Korea', '대한민국', '정치'],
    authors: [{ name: '선거 공약 아카이브' }],
    icons: {
      icon: [
        { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
    alternates: {
      languages: {
        ko: '/',
        en: '/?lang=en',
        ja: '/?lang=ja',
        zh: '/?lang=zh',
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { locale, dict } = await getLocaleAndDict()
  const htmlLang = localeHtmlLang[locale]

  return (
    <html
      lang={htmlLang}
      className={`${notoSansKr.variable} ${notoSerifKr.variable} bg-background`}
    >
      <body className="font-sans antialiased text-foreground bg-background min-h-screen">
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
