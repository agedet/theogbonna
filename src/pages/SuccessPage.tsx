import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import OgbonnaLogo from '@/assets/ogbonna-logo.png'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuccessState {
  orderId:    string;
  totalPrice: number;
  fullName:   string;
  email:      string;
  receiptUrl?: string;
}

// ─── Copy button (inline, no extra dep) ──────────────────────────────────────

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Checkmark animation ──────────────────────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
      className="flex size-20 items-center justify-center rounded-full bg-amber-500/10 border-2 border-amber-500/30 mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.25 }}
      >
        <CheckCircle2 className="size-10 text-amber-400" strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
}

// ─── Next steps list ──────────────────────────────────────────────────────────

// const NEXT_STEPS = [
//   {
//     n: 1,
//     title: 'Receipt submitted',
//     body: 'Your payment receipt has been uploaded and saved. The host has been notified.',
//   },
//   {
//     n: 2,
//     title: 'Payment verification',
//     body: 'The host will verify your transfer against the receipt. This usually takes 24 hours.',
//   },
//   {
//     n: 3,
//     title: 'Confirmation & dispatch',
//     body: 'Once verified you will receive a final confirmation email and your materials will be prepared for collection or delivery.',
//   },
// ];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SuccessPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  // Guard: if someone lands here directly without order state, send them home
  const state = location.state as SuccessState | null;
  useEffect(() => {
    if (!state?.orderId) navigate('/', { replace: true });
  }, [state, navigate]);

  if (!state?.orderId) return null;

  const { orderId, totalPrice, fullName, email, receiptUrl } = state;
  const firstName = fullName.split(' ')[0];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-xl items-center justify-between px-4 sm:h-[100px] sm:px-6">
          <Link to="/">
            <img
              src={OgbonnaLogo}
              alt="Ogbonna logo"
              className="h-12 w-auto object-contain sm:h-16"
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-start px-3 py-10 sm:px-4 sm:py-14">
        <div className="w-full max-w-lg space-y-6 sm:space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-4 text-center"
          >
            <AnimatedCheckmark />

            <div>
              <h1 className="mt-4 font-serif text-xl text-foreground sm:text-2xl">
                Order received, {firstName}!
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground px-1">
                Thank you for your order. A confirmation has been sent to{' '}
                <span className="break-all text-amber-600">{email}</span>.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Order Summary</p>
            </div>

            <div className="divide-y divide-border">
              <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-sm text-foreground">{orderId}</span>
                  <CopyButton text={orderId} label="order ID" />
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-bold text-amber-600">£{totalPrice}</span>
              </div>

              <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Receipt Submitted
                </span>
              </div>
              {receiptUrl && (
                <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                  <span className="text-sm text-muted-foreground">Receipt</span>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-600 underline underline-offset-2 transition-colors hover:text-amber-700"
                  >
                    View ↗
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="flex flex-col gap-3 pt-2 sm:flex-row"
          >
            <Button
              asChild
              variant="outline"
              className="h-12 flex-1 rounded-xl border-border text-foreground hover:bg-muted hover:text-foreground"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 size-4" />
                Back to Home
              </Link>
            </Button>

            <Button
              asChild
              className="h-12 flex-1 rounded-xl bg-amber-600 font-semibold text-white hover:bg-amber-700"
            >
              <a href="https://wa.me/447958198281" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 size-4" />
                Message Host on WhatsApp
              </a>
            </Button>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
