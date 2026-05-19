'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const INDUSTRIES = [
  'E-commerce',
  'SaaS',
  'Services',
  'Restaurant',
  'Healthcare',
  'Legal',
  'Real Estate',
  'Marketing Agency',
  'Consulting',
  'Other',
];

type BusinessRow = {
  id?: string;
  name?: string | null;
  website_url?: string | null;
  industry?: string | null;
  location?: string | null;
  description?: string | null;
};

interface Props {
  userId: string;
  existingBusiness: BusinessRow | null;
}

export function OnboardingClient({ userId: _userId, existingBusiness }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [business, setBusiness] = useState({
    name: existingBusiness?.name ?? '',
    website_url: existingBusiness?.website_url ?? '',
    industry: existingBusiness?.industry ?? '',
    location: existingBusiness?.location ?? '',
    description: existingBusiness?.description ?? '',
  });

  const canContinueStep1 =
    business.name.trim().length > 0 &&
    business.website_url.trim().length > 0 &&
    business.industry.length > 0;

  async function handleFinish(skipIntegrations: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, skipIntegrations }),
      });
      if (!res.ok) throw new Error(`Onboarding save failed (${res.status})`);
      router.push('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-6 py-12">
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={
              n <= step
                ? 'h-2 w-2 rounded-full bg-primary'
                : 'h-2 w-2 rounded-full bg-muted'
            }
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Tell us about your business</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We use this to tune your scans and agent outputs.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={business.website_url}
                onChange={(e) =>
                  setBusiness({ ...business, website_url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={business.industry}
                onValueChange={(v) => setBusiness({ ...business, industry: v })}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={business.location}
                onChange={(e) =>
                  setBusiness({ ...business, location: e.target.value })
                }
                placeholder="Tel Aviv, Israel"
              />
            </div>
            <div>
              <Label htmlFor="description">Short description (optional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={business.description}
                onChange={(e) =>
                  setBusiness({ ...business, description: e.target.value })
                }
                placeholder="One-line summary of what you do."
              />
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!canContinueStep1}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">
              Connect your analytics (optional)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll use Search Console and Analytics to suggest high-value agent
              work. You can skip and add later.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled
            >
              Connect Google Search Console
              <span className="ml-auto text-xs text-muted-foreground">
                Coming soon
              </span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled
            >
              Connect Google Analytics 4
              <span className="ml-auto text-xs text-muted-foreground">
                Coming soon
              </span>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              onClick={() => handleFinish(true)}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Saving...' : 'Go to dashboard'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
