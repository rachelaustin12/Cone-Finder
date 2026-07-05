import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail, Settings } from 'lucide-react';

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 max-w-lg mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-4xl mb-3">🗑️</div>
      <h1 className="font-nunito font-bold text-2xl mb-1" style={{ color: '#0ea5e9' }}>Data Deletion</h1>
      <p className="text-sm text-muted-foreground mb-8">Cone Finder — last updated June 2026</p>

      <div className="space-y-6 text-sm text-foreground leading-relaxed">

        {/* Section 1 */}
        <section className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-sky-500 shrink-0" />
            <h2 className="font-semibold text-base">Delete your van data in-app</h2>
          </div>
          <p className="text-muted-foreground mb-3">
            You can delete your van profile and all associated data (location history, messages, sightings) directly within the app at any time:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>Open the <strong className="text-foreground">Cone Finder</strong> app.</li>
            <li>Tap the <strong className="text-foreground">⚙️ Settings</strong> icon on the home screen (top right).</li>
            <li>Scroll to the bottom and tap <strong className="text-foreground">Delete my data</strong>.</li>
            <li>Confirm when prompted.</li>
          </ol>
          <p className="text-muted-foreground mt-3">
            This permanently removes your van profile, any customer messages sent to your van, and your van sightings. This action cannot be undone.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
            <h2 className="font-semibold text-base">Request full account deletion</h2>
          </div>
          <p className="text-muted-foreground mb-3">
            To have your entire account and all associated data permanently deleted from our systems, please contact us:
          </p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              <strong className="text-foreground">In-app:</strong> Go to ⚙️ Settings → tap <strong className="text-foreground">Contact Us</strong> and send a message requesting account deletion.
            </li>
            <li>
              <strong className="text-foreground">By email:</strong>{' '}
              <a href="mailto:anxiousoakley@gmail.com" className="text-sky-500 underline underline-offset-2">
                anxiousoakley@gmail.com
              </a>
              {' '}with the subject line <em>"Account Deletion Request"</em>.
            </li>
          </ul>
          <p className="text-muted-foreground mt-3">
            We will process your request within <strong className="text-foreground">30 days</strong> and confirm via email once your account and all data have been removed.
          </p>
        </section>

        {/* Section 3 — what's kept */}
        <section className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-100 dark:border-amber-900">
          <h2 className="font-semibold text-base text-amber-800 dark:text-amber-300 mb-2">What data is deleted vs. retained</h2>
          <div className="space-y-2 text-amber-700 dark:text-amber-400 text-xs">
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">Deleted immediately:</p>
              <p>Van profile, driver name, pricing & specialties, GPS location data, customer messages, van sightings, and reviews you submitted.</p>
            </div>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">Retained for up to 90 days (then auto-deleted):</p>
              <p>Basic account identifiers required for security and fraud prevention purposes, in accordance with applicable law.</p>
            </div>
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center pb-4">
          Visit us at{' '}
          <a href="https://conefinder.base44.app" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline underline-offset-2">
            conefinder.base44.app
          </a>
          {' '}· Questions? Email{' '}
          <a href="mailto:anxiousoakley@gmail.com" className="text-sky-500 underline underline-offset-2">
            anxiousoakley@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}