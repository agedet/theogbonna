import { useState, useId, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Copy, AlertCircle,
  Loader2, RefreshCw, UploadCloud, FileText, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import OgbonnaLogo from '@/assets/ogbonna-logo.png'

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE    = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const UNIT_PRICE  = 100; // GBP

const DELIVERY_OPTIONS = [
  { value: 'PICKUP',        label: 'Will Pickup',         fee: 0  },
  { value: 'LAGOS',         label: 'Lagos',               fee: 10 },
  { value: 'ABUJA',         label: 'Abuja',               fee: 10 },
  { value: 'PORT_HARCOURT', label: 'Port Harcourt',       fee: 6  },
  { value: 'ENUGU',         label: 'Enugu',               fee: 6  },
  { value: 'ONITSHA',       label: 'Onitsha',             fee: 6  },
  { value: 'OTHER',         label: 'Other (contact us)',  fee: 10 },
] as const;

type DeliveryValue = typeof DELIVERY_OPTIONS[number]['value'];

const BANK_DETAILS = {
  ng: {
    name:        'Elizabeth Onyechere',
    description: 'Ogbonnas Memorial',
    account:     '2122454891',
    bank:        'Zenith Bank',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string;
  whatsapp:        string;
  quantity:        number;
  deliveryOption:  DeliveryValue;
  deliveryAddress: string;
  deliveryState:   string;
  paymentRef:      string;
}

interface ExchangeRate { rate: number; cachedAt: string; source: string; }

interface OrderResult {
  id:          string;
  totalPrice:  number;
  deliveryFee: number;
  status:      string;
}

const initialForm: FormData = {
  firstName: '',
  lastName:  '',
  email: '', 
  phone: '', 
  whatsapp: '',
  quantity: 1, 
  deliveryOption: 'PICKUP',
  deliveryAddress: '', 
  deliveryState: '', 
  paymentRef: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDeliveryFee(o: DeliveryValue) {
  return DELIVERY_OPTIONS.find(d => d.value === o)?.fee ?? 0;
}
function getDeliveryLabel(o: DeliveryValue) {
  return DELIVERY_OPTIONS.find(d => d.value === o)?.label ?? o;
}
function computeTotal(qty: number, d: DeliveryValue) {
  return qty * UNIT_PRICE + getDeliveryFee(d);
}
function formatNgn(n: number) {
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

// ─── Exchange rate hook ───────────────────────────────────────────────────────

function useExchangeRate() {
  const [data, setData]       = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  async function fetch_() {
    setLoading(true); setError(false);
    try {
      const res = await fetch(`${API_BASE}/exchange-rate/gbp-ngn?amount=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch { setError(true); }
    finally  { setLoading(false); }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch_();
  }, []);

  return { data, loading, error, refetch: fetch_ };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NgnEquivalent({ gbpTotal, rate, loading, error, onRetry }: {
  gbpTotal: number; rate: ExchangeRate | null;
  loading: boolean; error: boolean; onRetry: () => void;
}) {
  // Capture render time once so Date.now() isn't called in the pure render path
  const [now] = useState<number>(() => Date.now());

  if (loading) return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <Loader2 className="size-3 animate-spin" /> Fetching live NGN rate…
    </div>
  );
  if (error || !rate) return (
    <button type="button" onClick={onRetry}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400">
      <RefreshCw className="size-3" /> Could not load NGN rate — tap to retry
    </button>
  );
  const ngn      = Math.round(gbpTotal * rate.rate);
  const ageMin   = Math.round((now - new Date(rate.cachedAt).getTime()) / 60_000);
  const ageLabel = ageMin < 1 ? 'just now' : `${ageMin}m ago`;  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-sm font-semibold text-emerald-400">{formatNgn(ngn)}</span>
      <span className="text-xs text-slate-500">
        at ₦{Math.round(rate.rate).toLocaleString('en-NG')}/£ · updated {ageLabel}
      </span>
      <button type="button" onClick={onRetry} className="text-slate-600 hover:text-slate-400"
        title="Refresh rate" aria-label="Refresh exchange rate">
        <RefreshCw className="size-3" />
      </button>
    </div>
  );
}

const STEPS = ['Your Details', 'Review Order', 'Payment', 'Upload Receipt'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-1 overflow-x-auto pb-1 sm:mb-10 sm:items-center sm:justify-center sm:gap-0 sm:overflow-visible">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        const last   = i === STEPS.length - 1;
        return (
          <div key={i} className="flex min-w-0 flex-1 items-center sm:flex-none">
            <div className="flex w-full flex-col items-center gap-1 sm:w-auto sm:gap-1.5">
              <div className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300 sm:size-8 sm:text-sm',
                done   && 'border-amber-500 bg-amber-500 text-white',
                active && 'border-amber-500 bg-transparent text-amber-500',
                !done && !active && 'border-slate-700 bg-transparent text-slate-600',
              )}>
                {done ? <Check className="size-3.5 sm:size-4" /> : i + 1}
              </div>
              <span className={cn(
                'max-w-[4.5rem] text-center text-[0.6rem] leading-tight font-medium sm:max-w-none sm:whitespace-nowrap sm:text-xs',
                active ? 'text-amber-400' : done ? 'text-amber-500/70' : 'text-slate-600',
              )}>{label}</span>
            </div>
            {!last && (
              <div className={cn(
                'mx-0.5 mb-4 hidden h-px w-6 shrink-0 transition-colors duration-300 sm:mx-1 sm:mb-5 sm:block sm:w-10 md:w-14',
                done ? 'bg-amber-500' : 'bg-slate-700',
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, error, required, children, htmlFor }: {
  label: string; error?: string; required?: boolean;
  children: React.ReactNode; htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-slate-300">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="size-3" />{error}
        </p>
      )}
    </div>
  );
}

function QuantityStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center rounded-md border border-white/10 w-fit overflow-hidden">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}
        className="flex size-9 items-center justify-center bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
        aria-label="Decrease quantity">−</button>
      <span className="min-w-[2.5rem] text-center text-sm font-semibold text-white px-3 py-2 bg-white/[0.03]">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(10, value + 1))} disabled={value >= 10}
        className="flex size-9 items-center justify-center bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
        aria-label="Increase quantity">+</button>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button type="button" onClick={handleCopy}
      className="flex items-center gap-1 text-xs ttext-amber-400 hover:text-amber-300 transition-colors"
      aria-label={`Copy ${text}`}>
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Step 1 — Personal details ────────────────────────────────────────────────

function StepDetails({ data, onChange, onNext }: {
  data: FormData; onChange: (p: Partial<FormData>) => void; onNext: () => void;
}) {
  const id = useId();
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function validate() {
    const e: typeof errors = {};
    if (!data.firstName.trim()) e.firstName = 'First name is required.';
    if (!data.lastName.trim())  e.lastName  = 'Last name is required.';
    if (!data.email.trim())     e.email     = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email.';
    if (!data.phone.trim())     e.phone     = 'Phone number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First Name" required error={errors.firstName} htmlFor={`${id}-fname`}>
          <Input id={`${id}-fname`} placeholder="e.g. Clinton"
            value={data.firstName} onChange={e => onChange({ firstName: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
            aria-invalid={!!errors.firstName} />
        </Field>
        <Field label="Last Name" required error={errors.lastName} htmlFor={`${id}-lname`}>
          <Input id={`${id}-lname`} placeholder="e.g. Shepherd"
            value={data.lastName} onChange={e => onChange({ lastName: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
            aria-invalid={!!errors.lastName} />
        </Field>
      </div>
      <Field label="Email Address" required error={errors.email} htmlFor={`${id}-email`}>
        <Input id={`${id}-email`} type="email" placeholder="you@example.com"
          value={data.email} onChange={e => onChange({ email: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
          aria-invalid={!!errors.email} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Phone Number" required error={errors.phone} htmlFor={`${id}-phone`}>
          <Input id={`${id}-phone`} type="tel" placeholder="+234 800 000 0000"
            value={data.phone} onChange={e => onChange({ phone: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
            aria-invalid={!!errors.phone} />
        </Field>
        <Field label="WhatsApp Number" htmlFor={`${id}-wa`}>
          <Input id={`${id}-wa`} type="tel" placeholder="Same as phone? Leave blank"
            value={data.whatsapp} onChange={e => onChange({ whatsapp: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11" />
        </Field>
      </div>
      <Button type="button" onClick={() => { if (validate()) onNext(); }}
        className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl mt-2">
        Continue <ChevronRight className="ml-1 size-4" />
      </Button>
    </div>
  );
}

// ─── Step 2 — Review order ────────────────────────────────────────────────────

function StepReview({ data, onChange, onBack, onNext }: {
  data: FormData; onChange: (p: Partial<FormData>) => void;
  onBack: () => void; onNext: () => void;
}) {
  const id = useId();
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const needsAddress = data.deliveryOption !== 'PICKUP';
  const deliveryFee  = getDeliveryFee(data.deliveryOption);
  const total        = computeTotal(data.quantity, data.deliveryOption);

  function validate() {
    const e: typeof errors = {};
    if (needsAddress && !data.deliveryAddress.trim()) e.deliveryAddress = 'Delivery address is required.';
    if (needsAddress && !data.deliveryState.trim())   e.deliveryState   = 'State is required.';
    setErrors(e); return Object.keys(e).length === 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">How many sets?</p>
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-white text-sm sm:text-base">5 Yards Beaded Lace &amp; Gele</p>
            <p className="mt-0.5 text-sm text-slate-500">£{UNIT_PRICE} per set</p>
          </div>
          <QuantityStepper value={data.quantity} onChange={q => onChange({ quantity: q })} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">Delivery option</p>
        <Select value={data.deliveryOption}
          onValueChange={v => onChange({ deliveryOption: v as DeliveryValue, deliveryAddress: '', deliveryState: '' })}>
          <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}{opt.fee > 0 ? ` (+£${opt.fee})` : ' (Free)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <AnimatePresence>
        {needsAddress && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-4">
            <Field label="Delivery Address" required error={errors.deliveryAddress} htmlFor={`${id}-addr`}>
              <Input id={`${id}-addr`} placeholder="Street address, landmark…"
                value={data.deliveryAddress} onChange={e => onChange({ deliveryAddress: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
                aria-invalid={!!errors.deliveryAddress} />
            </Field>
            <Field label="State" required error={errors.deliveryState} htmlFor={`${id}-state`}>
              <Input id={`${id}-state`} placeholder="e.g. Lagos State"
                value={data.deliveryState} onChange={e => onChange({ deliveryState: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11"
                aria-invalid={!!errors.deliveryState} />
            </Field>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-slate-400">Materials ({data.quantity} × £{UNIT_PRICE})</span>
          <span className="text-white font-medium">£{data.quantity * UNIT_PRICE}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-slate-400">Delivery ({getDeliveryLabel(data.deliveryOption)})</span>
          <span className="text-white font-medium">{deliveryFee > 0 ? `£${deliveryFee}` : 'Free'}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-slate-400 font-semibold">Total</span>
          <span className="text-amber-600 font-bold text-lg">£{total}</span>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack}
          className="h-12 flex-1 rounded-xl border-white/10 text-slate-900 hover:text-white hover:bg-white/10">
          <ChevronLeft className="mr-1 size-4" /> Back
        </Button>
        <Button type="button" onClick={() => { if (validate()) onNext(); }}
          className="h-12 flex-1 rounded-xl bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 sm:text-base">
          Proceed to Payment <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3 — Payment ─────────────────────────────────────────────────────────

function StepPayment({ data, onBack, onSubmit, submitting, serverError, exchangeRate, rateLoading, rateError, onRateRetry }: {
  data: FormData; onChange: (p: Partial<FormData>) => void;
  onBack: () => void; onSubmit: () => void;
  submitting: boolean; serverError: string | null;
  exchangeRate: ExchangeRate | null; rateLoading: boolean;
  rateError: boolean; onRateRetry: () => void;
}) {
  // const id    = useId();
  const total = computeTotal(data.quantity, data.deliveryOption);

  return (
    <div className="space-y-6">
      {/* Amount due */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-400">Amount due</p>
            <p className="mt-0.5 text-2xl font-bold text-amber-600 sm:text-3xl">£{total}</p>
            <div className="mt-1.5">
              <NgnEquivalent gbpTotal={total} rate={exchangeRate}
                loading={rateLoading} error={rateError} onRetry={onRateRetry} />
            </div>
          </div>
          <div className="shrink-0 text-left text-xs text-slate-500 sm:pt-1 sm:text-right">
            <p>{data.quantity} set(s)</p>
            <p>{getDeliveryLabel(data.deliveryOption)}</p>
          </div>
        </div>
      </div>

      {/* Bank details */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Bank Transfer Details</p>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2.5">
          <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider mb-3">🇳🇬 Nigeria Account</p>
          {([
            { label: 'Account Name', value: BANK_DETAILS.ng.name        },
            { label: 'Description',  value: BANK_DETAILS.ng.description },
            { label: 'Account No.',  value: BANK_DETAILS.ng.account     },
            { label: 'Bank',         value: BANK_DETAILS.ng.bank        },
          ] as { label: string; value: string }[]).map(row => (
            <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="shrink-0 text-xs text-slate-500">{row.label}</span>
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-mono text-white">{row.value}</span>
                <CopyButton text={row.value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment reference */}
      <div className="space-y-1.5">
        {/* <Field 
              label="Payment Reference (optional)" 
              htmlFor={`${id}-ref`}
        >
          <Input 
            id={`${id}-ref`} 
            placeholder="Your bank transfer reference or receipt number"
            value={data.paymentRef} 
            onChange={e => onChange({ paymentRef: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11" 
          />
        </Field> */}
        <p className="text-xs text-slate-500">
          You can submit now and upload your receipt in the next step.
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />{serverError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack} 
          disabled={submitting}
          className="h-12 flex-1 rounded-xl border-white/10 text-slate-900 hover:text-white hover:bg-white/10">
          <ChevronLeft className="mr-1 size-4" /> Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={submitting}
          className="h-12 flex-1 rounded-xl bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 sm:text-base">
          {submitting
            ? <><Loader2 className="mr-2 size-4 animate-spin" /> Submitting…</>
            : <>I Have Paid &amp; Continue <ChevronRight className="ml-1 size-4" /></>}
        </Button>
      </div>
      <p className="text-center text-xs text-slate-600 leading-relaxed">
        By continuing you agree to our payment terms.
      </p>
    </div>
  );
}

// ─── Step 4 — Upload Receipt ──────────────────────────────────────────────────

function StepUpload({ form, order, onBack, onDone }: {
  form:   FormData;
  order:  OrderResult;
  onBack: () => void;
  onDone: (receiptUrl: string, whatsappUrl: string) => void;
}) {
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [dragOver, setDragOver]   = useState(false);

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const MAX_MB  = 10;

  function pickFile(f: File) {
    if (!ALLOWED.includes(f.type)) {
      setError('Only JPG, PNG, WebP, or PDF files are allowed.'); return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum is ${MAX_MB} MB.`); return;
    }
    setError(null);
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null); // PDF — show name only
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }

  async function handleUpload() {
    if (!file) { setError('Please select a file first.'); return; }
    setUploading(true); setError(null);

    // Simulate chunked progress (real progress needs XHR)
    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + 10, 85));
    }, 300);

    try {
      const fd = new FormData();
      fd.append('receipt', file);

      const res = await fetch(`${API_BASE}/orders/${order.id}/receipt`, {
        method: 'POST',
        body: fd,
      });

      clearInterval(ticker); setProgress(100);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(body.message) ? body.message[0] : body.message ?? 'Upload failed.',
        );
      }

      const result = await res.json() as { receiptUrl: string; whatsappUrl: string };
      onDone(result.receiptUrl, result.whatsappUrl);
    } catch (err) {
      clearInterval(ticker); setProgress(0);
      setError((err as Error).message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const total = computeTotal(form.quantity, form.deliveryOption);

  return (
    <div className="space-y-6">
      {/* Order recap */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Summary</p>
        </div>
        {[
          { label: 'Order ID',    value: order.id },
          { label: 'Name',        value: `${form.firstName} ${form.lastName}` },
          { label: 'Quantity',    value: `${form.quantity} set(s)` },
          { label: 'Total Paid',  value: `£${total}` },
          { label: 'Delivery',    value: getDeliveryLabel(form.deliveryOption) },
        ].map(row => (
          <div key={row.label} className="flex flex-col gap-0.5 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span className="shrink-0 text-slate-500">{row.label}</span>
            <span className="break-all font-mono font-medium text-white sm:text-right">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">
          Upload proof of payment <span className="text-amber-600">*</span>
        </p>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 cursor-pointer transition-all duration-200 sm:px-6 sm:py-10',
            dragOver ? 'border-amber-500 bg-amber-500/10'
              : file  ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload receipt"
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          {!file ? (
            <>
              <UploadCloud className={cn('size-10', dragOver ? 'text-amber-500' : 'text-slate-600')} />
              <div className="text-center">
                <p className="text-sm text-slate-300">Drop your receipt here or <span className="text-amber-600 underline">browse</span></p>
                <p className="text-xs text-slate-600 mt-1">JPG, PNG, WebP, or PDF · max 10 MB</p>
              </div>
            </>
          ) : (
            <>
              {preview
                ? <img src={preview} alt="Receipt preview"
                    className="max-h-32 w-full max-w-xs rounded-xl object-contain sm:max-h-40" />
                : <div className="flex items-center gap-2">
                    <FileText className="size-8 text-slate-400" />
                    <p className="text-sm text-foreground">{file.name}</p>
                  </div>
              }
              <button type="button" aria-label="Remove file"
                onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="size-3.5" />
              </button>
              <p className="text-xs text-emerald-400">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Uploading…</span><span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.3 }} />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} disabled={uploading}
          className="h-12 flex-1 rounded-xl border-white/10 text-slate-900 hover:text-white hover:bg-white/10">
          <ChevronLeft className="mr-1 size-4" /> Back
        </Button>
        <Button type="button" onClick={handleUpload} disabled={uploading || !file}
          className="h-12 flex-1 rounded-xl bg-amber-600 font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
          {uploading
            ? <><Loader2 className="mr-2 size-4 animate-spin" /> Uploading…</>
            : <><UploadCloud className="mr-2 size-4" /> Submit Receipt</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ?  60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -60 :  60, opacity: 0 }),
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm]           = useState<FormData>(initialForm);
  const [order, setOrder]         = useState<OrderResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: exchangeRate, loading: rateLoading, error: rateError, refetch: rateRetry } = useExchangeRate();

  function patch(update: Partial<FormData>) { setForm(prev => ({ ...prev, ...update })); }
  function goNext() { setDirection(1);  setStep(s => s + 1); }
  function goBack() { setDirection(-1); setStep(s => s - 1); setServerError(null); }

  async function handleSubmit() {
    setSubmitting(true); setServerError(null);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:       form.firstName,
          lastName:        form.lastName,
          email:           form.email,
          phone:           form.phone,
          whatsapp:        form.whatsapp        || undefined,
          quantity:        form.quantity,
          deliveryOption:  form.deliveryOption,
          deliveryAddress: form.deliveryAddress || undefined,
          deliveryState:   form.deliveryState   || undefined,
          paymentRef:      form.paymentRef       || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg  = Array.isArray(body.message) ? body.message[0] : body.message ?? 'Something went wrong.';
        setServerError(msg); return;
      }
      const result: OrderResult = await res.json();
      setOrder(result);
      goNext(); // → step 3 (upload)
    } catch {
      setServerError('Could not reach the server. Please check your connection and try again.');
    } finally { setSubmitting(false); }
  }

  function handleUploadDone(receiptUrl: string, whatsappUrl: string) {
    // Navigate to success page, then open WhatsApp in a new tab
    navigate('/success', {
      state: {
        orderId:    order!.id,
        totalPrice: order!.totalPrice,
        fullName:   `${form.firstName} ${form.lastName}`,
        email:      form.email,
        receiptUrl,
      },
    });
    // Short delay so the navigation fires first
    setTimeout(() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer'), 500);
  }

  const stepContent = [
    <StepDetails key="details" data={form} onChange={patch} onNext={goNext} />,
    <StepReview  key="review"  data={form} onChange={patch} onBack={goBack} onNext={goNext} />,
    <StepPayment key="payment" data={form} onChange={patch} onBack={goBack}
      onSubmit={handleSubmit} submitting={submitting} serverError={serverError}
      exchangeRate={exchangeRate} rateLoading={rateLoading}
      rateError={rateError} onRateRetry={rateRetry} />,
    order
      ? <StepUpload key="upload" form={form} order={order} onBack={goBack} onDone={handleUploadDone} />
      : <div key="upload-loading" className="text-center text-slate-500 py-10"><Loader2 className="size-6 animate-spin mx-auto" /></div>,
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-xl items-center justify-between px-4 sm:h-[100px] sm:px-6">
          <Link to="/" className="shrink-0">
            <img
              src={OgbonnaLogo}
              alt="Ogbonna logo"
              className="h-12 w-auto object-contain sm:h-16"
            />
          </Link>
          <span className="text-[0.65rem] font-mono tracking-wider text-slate-500 uppercase sm:text-xs">
            Secure Checkout
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-start px-3 py-8 sm:px-4 sm:py-12">
        <div className="w-full max-w-xl">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="font-serif text-xl text-white sm:text-2xl">Asoebi Order</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              5 Yards Beaded Lace &amp; Gele — £100 per set
            </p>
          </div>

          <StepIndicator current={step} />

          <div className="relative overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div key={step} custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}>
                {stepContent[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-red-400/70 mt-8">
            Payment deadline: <strong className="text-red-400">September 30, 2026</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
