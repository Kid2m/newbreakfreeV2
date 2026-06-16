"use client";

import { useCallback, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackViewContent, trackInitiateCheckout } from '@/lib/meta-client';
import '@/styles/stripe.css';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export type EmbeddedCheckoutProductType = 'donation' | 'subscription' | 'upsell' | 'masterclass' | 'journal';

interface EmbeddedCheckoutPageProps {
  amount: number;
  productType: EmbeddedCheckoutProductType;
  productName: string;
  email: string;
  name?: string;
  onBack?: () => void;
  returnUrl?: string;
}

export default function EmbeddedCheckoutPage({
  amount, productType, productName, email, name, onBack, returnUrl,
}: EmbeddedCheckoutPageProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackViewContent({ contentName: `Checkout - ${productName}` });
    trackInitiateCheckout({ value: amount, currency: 'USD' });
  }, [productName, email, name, amount]);

  const fetchClientSecret = useCallback(async () => {
    const response = await fetch('/api/create-embedded-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100), email, name, productType, productName,
        returnUrl: returnUrl || `${window.location.origin}/quiz?state=results&payment_success=true`,
      }),
    });
    const data = await response.json();
    if (data.error) { setError(data.error); throw new Error(data.error); }
    return data.clientSecret;
  }, [amount, email, name, productType, productName, returnUrl]);

  if (!stripePublicKey || !stripePromise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-card-border/50 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Configuration Error</h2>
          <p className="text-muted-foreground text-sm">Payment system not configured. Contact support.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-card-border/50 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Checkout Error</h2>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={() => setError(null)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-10">
      <div className="max-w-lg mx-auto px-5 sm:px-6 w-full">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </button>
        )}
        <div className="bg-card rounded-3xl p-5 sm:p-8 shadow-xl border border-card-border/50 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Secure Checkout</h2>
          <p className="text-muted-foreground text-sm mb-6">Complete your purchase of {productName}</p>
          <div className="bg-background/50 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <span className="text-foreground font-medium">{productName}</span>
            <span className="text-primary font-bold">${amount.toFixed(2)}</span>
          </div>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout className="stripe-embedded-checkout" />
          </EmbeddedCheckoutProvider>
        </div>
        <p className="text-xs text-muted-foreground text-center">Secure payment powered by Stripe</p>
      </div>
    </div>
  );
}
