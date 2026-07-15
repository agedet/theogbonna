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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-xl mx-auto px-6 h-[100px] flex items-center justify-between">
          <Link to="/">
            <img 
              src={OgbonnaLogo}
              alt='logo'
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      {/* <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-serif text-amber-500 tracking-widest uppercase">
            Ogbonnas
          </Link>
        </div>
      </header> */}

      <main className="flex-1 flex flex-col items-center justify-start py-14 px-4">
        <div className="w-full max-w-lg space-y-8">

          {/* Hero confirmation block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center space-y-4"
          >
            <AnimatedCheckmark />

            <div>
              <h1 className="text-2xl font-serif text-white mt-4">
                Order received, {firstName}!
              </h1>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                Thank you for your order. A confirmation has been sent to{' '}
                <span className="text-amber-400">{email}</span>.
              </p>
            </div>
          </motion.div>

          {/* Order summary card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Summary</p>
            </div>

            <div className="divide-y divide-white/[0.06]">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-slate-400">Order ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">{orderId}</span>
                  <CopyButton text={orderId} label="order ID" />
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-slate-400">Amount</span>
                <span className="text-amber-400 font-bold">£{totalPrice}</span>
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-slate-400">Status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Receipt Submitted
                </span>
              </div>
              {receiptUrl && (
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-slate-400">Receipt</span>
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                    View ↗
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          {/* Email notice */}
          {/* <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
            className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3"
          >
            <Mail className="size-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300/80 leading-relaxed">
              A confirmation email has been sent to{' '}
              <strong className="text-blue-300">{email}</strong>. The host has also been notified. Check your spam folder if it doesn't arrive within a few minutes.
            </p>
          </motion.div> */}

          {/* Next steps */}
          {/* <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4, ease: 'easeOut' }}
            className="space-y-3"
          >
            <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">What happens next</p>

            <div className="space-y-3">
              {NEXT_STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.45 + i * 0.08 }}
                  className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 mt-0.5">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div> */}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Button
              asChild
              variant="outline"
              className="flex-1 h-12 rounded-xl border-white/10 text-slate-900 hover:text-white hover:bg-white/10"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 size-4" />
                Back to Home
              </Link>
            </Button>

            <Button
              asChild
              className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              <a href="https://wa.me/447958198281" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 size-4" />
                Message Host on WhatsApp
              </a>
            </Button>
          </motion.div>

          {/* Footer note */}
          {/* <p className="text-center text-xs text-slate-600 pb-4">
            Payment deadline: <span className="text-red-400/70 font-medium">September 30, 2026</span>
            {' · '}
            Questions? Email{' '}
            <a href="mailto:ndliz2001@hotmail.co.uk" className="text-amber-500/60 hover:text-amber-400 transition-colors">
              ndliz2001@hotmail.co.uk
            </a>
          </p> */}

        </div>
      </main>
    </div>
  );
}
