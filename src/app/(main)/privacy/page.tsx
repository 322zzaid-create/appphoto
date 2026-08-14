import { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for apex - How we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Privacy Policy"
        description="Last updated: July 2025"
        breadcrumbs={[{ label: 'Privacy Policy', href: '/privacy' }]}
      />
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/70">
        <section>
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>When you use apex, we may collect the following information:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong className="text-white">Account Information:</strong> Email address, username, and profile picture when you create an account.</li>
            <li><strong className="text-white">Usage Data:</strong> Pages visited, wallpapers viewed, downloaded, liked, and search queries.</li>
            <li><strong className="text-white">Device Information:</strong> Browser type, operating system, screen resolution, and device type.</li>
            <li><strong className="text-white">IP Address:</strong> Used for security, analytics, and rate limiting.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>To provide and maintain the apex service.</li>
            <li>To personalize your experience and recommend wallpapers.</li>
            <li>To track download statistics and improve our service.</li>
            <li>To send notifications about new wallpapers or updates (if opted in).</li>
            <li>To prevent abuse, spam, and unauthorized access.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">3. Data Storage and Security</h2>
          <p>Your data is stored securely using Supabase (PostgreSQL database). We implement industry-standard security measures including:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Encrypted data transmission (TLS/SSL).</li>
            <li>Row Level Security (RLS) policies on all database tables.</li>
            <li>Signed URLs for private file access with time-limited expiry.</li>
            <li>Rate limiting to prevent abuse.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong className="text-white">Supabase:</strong> Authentication, database, and file storage.</li>
            <li><strong className="text-white">Vercel:</strong> Hosting and deployment.</li>
            <li><strong className="text-white">Advertising Networks:</strong> To display ads (you can opt out through your device settings).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">5. Cookies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Maintain your authentication session.</li>
            <li>Remember your preferences and settings.</li>
            <li>Analyze usage patterns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Access, update, or delete your personal information.</li>
            <li>Opt out of non-essential data collection.</li>
            <li>Request a copy of your data.</li>
            <li>Withdraw consent at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">7. Content Ownership</h2>
          <p>Wallpapers uploaded to apex remain the intellectual property of their respective creators. We do not claim ownership over user-uploaded content.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">8. Children&apos;s Privacy</h2>
          <p>apex is not intended for users under the age of 13. We do not knowingly collect personal information from children.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@wallpaperhub.app.</p>
        </section>
      </div>
    </div>
  )
}
