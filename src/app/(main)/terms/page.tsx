import { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Wallpaper Hub - Rules and guidelines for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Terms of Service"
        description="Last updated: July 2025"
        breadcrumbs={[{ label: 'Terms of Service', href: '/terms' }]}
      />
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/70">
        <section>
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>By accessing and using Wallpaper Hub, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">2. Description of Service</h2>
          <p>Wallpaper Hub is a platform for discovering, sharing, and downloading wallpapers for phones, tablets, and desktops. Our service includes:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Browsing and searching wallpapers.</li>
            <li>Downloading wallpapers in various qualities.</li>
            <li>Downloading wallpapers for personal use.</li>
            <li>Uploading wallpapers (for authorized users).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">3. User Accounts</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>You must be at least 13 years old to create an account.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must not share your account credentials with others.</li>
            <li>One person may not maintain more than one account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">4. Content Guidelines</h2>
          <p>When uploading content to Wallpaper Hub, you agree that:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>You own or have the necessary rights to the content.</li>
            <li>The content does not violate any copyright, trademark, or intellectual property rights.</li>
            <li>The content does not contain malware, viruses, or harmful code.</li>
            <li>The content is not offensive, pornographic, or inappropriate.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">5. Intellectual Property</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Wallpapers remain the property of their original creators.</li>
            <li>Wallpaper Hub does not claim ownership of user-uploaded content.</li>
            <li>By uploading content, you grant Wallpaper Hub a non-exclusive license to display and distribute your content on the platform.</li>
            <li>You may not redistribute wallpapers outside of Wallpaper Hub without the creator&apos;s permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">6. Prohibited Activities</h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Use the service for any illegal purpose.</li>
            <li>Attempt to gain unauthorized access to any part of the service.</li>
            <li>Scrape, crawl, or use automated tools to download content.</li>
            <li>Violate rate limits or bypass security measures.</li>
            <li>Impersonate another user or entity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">7. Downloads and Usage</h2>
          <p>Wallpapers downloaded from Wallpaper Hub are for personal use only. Commercial use of downloaded wallpapers requires explicit permission from the original creator.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">8. Advertising</h2>
          <p>Wallpaper Hub may display advertisements. Certain premium content may be unlocked by viewing advertisements. We reserve the right to change our advertising practices at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">9. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">10. Limitation of Liability</h2>
          <p>Wallpaper Hub is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from the use of our service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">11. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">12. Contact</h2>
          <p>For questions about these Terms, contact us at support@wallpaperhub.app.</p>
        </section>
      </div>
    </div>
  )
}
