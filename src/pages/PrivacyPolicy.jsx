import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-nunito">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold flex-1">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Privacy Policy</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">1. Introduction</h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.

          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">2. Information We Collect</h3>
          <p className="text-sm text-foreground leading-relaxed mb-3">We may collect information about you in a variety of ways, including:</p>
          <ul className="text-sm text-foreground space-y-2 mb-4 ml-4">
            <li><strong>Location Data:</strong> When you use our map features, we collect your location to show nearby ice cream vans.</li>
            <li><strong>Account Information:</strong> Email, name, and profile details for drivers.</li>
            <li><strong>User-Generated Content:</strong> Reviews, ratings, photos, and sighting reports you submit.</li>
            <li><strong>Device Information:</strong> Device type, operating system, and app usage data.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">3. How We Use Your Information</h3>
          <p className="text-sm text-foreground leading-relaxed mb-3">We use the information we collect to:</p>
          <ul className="text-sm text-foreground space-y-2 mb-4 ml-4">
            <li>Provide and maintain our app functionality</li>
            <li>Display ice cream van locations and sightings to users</li>
            <li>Enable drivers to share their location with customers</li>
            <li>Process reviews and ratings</li>
            <li>Improve and optimize our services</li>
            <li>Communicate with you about updates and features</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">4. Location Privacy</h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            Location data is used solely to display van positions and help users find nearby ice cream vans. Your location is never shared without your consent, and drivers can control when their location is shared through the location toggle feature.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">5. Data Security</h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">6. Third-Party Services</h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            Our app uses map services (OpenStreetMap/Leaflet) to display location data. Please review their privacy policies for more information about how they handle data.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">7. User Rights</h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            You may request access to, correction of, or deletion of your personal information at any time by contacting us. Drivers can delete their account and all associated data through the app dashboard.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">8. Changes to This Policy</h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date above.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">9. Contact Us</h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            If you have questions about this Privacy Policy, please visit our app at{' '}
            <a href="https://conefinder.base44.app" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline underline-offset-2">conefinder.base44.app</a>
            {' '}or contact us through the app.
          </p>

          <div className="mt-12 pt-6 border-t border-border/50">
            <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl">
              Back to App
            </Button>
          </div>
        </div>
      </main>
    </div>);

}