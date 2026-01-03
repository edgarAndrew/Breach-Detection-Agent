import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import UserJourney from '@/components/user-journey';
import {
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Clock,
  Play,
} from 'lucide-react';
import Link from 'next/link';


export const metadata: Metadata = {
  title: 'Covenant Breach Detection Agent',
  description:
    'Automated monitoring for covenant and rule breaches. Define rules, run checks, and receive alerts before limits are violated.',

  applicationName: 'Covenant Breach Detection',

  keywords: [
    'covenant monitoring',
    'breach detection',
    'financial covenants',
    'rule-based alerts',
    'risk monitoring',
  ],
}
function HeroSection() {
  return (
    <section className="px-6 py-10 md:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Covenant Breach Detection Agent
        </h1>

        <p className="text-xl text-gray-600 mb-2">
          Checks rules → raises alerts
        </p>

        <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl">
          An automated rule-checker that warns you before something breaks.
          Think of it like a smoke alarm for rule violations.
        </p>

        <div className="flex gap-4">
          <Button variant='outline' className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-900">
            <Link href="/auth/signin">Log In</Link>
          </Button>
          <Button variant='outline' className="px-6 py-3 bg-black text-white rounded-md font-medium">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================
function HowItWorksSection() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Define Rules
            </h3>
            <p className="text-gray-600">
              Set up rules in a simple config file.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Run Checks
            </h3>
            <p className="text-gray-600">
              Execute on demand or on a schedule.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Get Alerts
            </h3>
            <p className="text-gray-600">
              Receive instant notifications with clear explanations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ALERT SYSTEM SECTION
// ============================================================================
function AlertSystemSection() {
  return (
    <section className="px-6 py-16 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          Alert System
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Near Breach
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Warning when metrics approach defined limits.
            </p>
          </div>

          <div className="border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Breach Detected
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Immediate alert when a rule is violated.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ALERT CONTENTS SECTION
// ============================================================================
function AlertContentsSection() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          What Each Alert Includes
        </h2>

        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-gray-900 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Rule Violated
                </h3>
                <p className="text-gray-600">
                  Clear statement of which rule was triggered.
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-gray-900 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Current vs Limit
                </h3>
                <p className="text-gray-600">
                  Side-by-side comparison of value and threshold.
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex gap-3">
              <TrendingDown className="h-5 w-5 text-gray-900 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Trend Analysis
                </h3>
                <p className="text-gray-600">
                  Directional insight into metric movement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// RUN CHECKS SECTION
// ============================================================================
function RunChecksSection() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          Run Checks Anytime
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-8">
            <Clock className="h-8 w-8 text-gray-900 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Scheduled Runs
            </h3>
            <p className="text-gray-600">
              Automated checks on a defined cadence.
            </p>
          </div>

          <div className="border rounded-lg p-8">
            <Play className="h-8 w-8 text-gray-900 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              On-Demand
            </h3>
            <p className="text-gray-600">
              Execute checks instantly when needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER SECTION
// ============================================================================
function FooterSection() {
  return (
    <footer className="mt-auto px-6 py-6">
      <div className="max-w-4xl mx-auto text-sm text-gray-500">
        © {new Date().getFullYear()} Covenant Breach Detection. All rights reserved.
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function CovenantBreachLanding() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <HeroSection />
      <UserJourney />
      <HowItWorksSection />
      <AlertSystemSection />
      <AlertContentsSection />
      <RunChecksSection />
      <FooterSection />
    </main>
  );
}