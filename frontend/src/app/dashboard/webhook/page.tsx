// app/webhook/page.tsx
import type { Metadata } from 'next';
import { Webhook } from '@/components/webhook/webhook-form';

export const metadata: Metadata = {
  title: "Webhook | ORIX-McLaren",
  description: "Configure your webhook endpoint to receive real-time alerts.",
};

export default function AddWebhookPage() {
  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-10">
        <Webhook />
      </section>
    </main>
  );
}