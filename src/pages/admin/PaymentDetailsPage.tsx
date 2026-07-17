import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { StatusBadge, formatStatusLabel, type Transaction } from '@/components/admin';
import { api } from '@/lib/api';

interface PaymentDetail extends Transaction {
  attendees?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    deliveryAddress?: string;
  } | null;
  orders?: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    quantity?: number;
    totalPrice: number;
    status: string;
    receiptUrl?: string | null;
    deliveryOption?: string;
    deliveryAddress?: string | null;
    deliveryState?: string | null;
    paymentRef?: string | null;
    createdAt?: string;
  } | null;
}

export default function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listPath = location.pathname.startsWith('/super-admin')
    ? '/super-admin/payments'
    : '/admin/payments';
  const ordersBase = location.pathname.startsWith('/super-admin')
    ? '/super-admin/orders'
    : '/admin/orders';

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<PaymentDetail>(`/admin/payments/${id}`)
      .then(data => {
        if (!cancelled) setPayment(data);
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load payment');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-slate-600" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6 space-y-4">
        <Link to={listPath} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to payments
        </Link>
        <p className="text-sm text-red-500">{error ?? 'Payment not found.'}</p>
      </div>
    );
  }

  const attendee = payment.attendees;
  const order = payment.orders;
  const receiptUrl = payment.receiptUrl ?? order?.receiptUrl;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <Link
            to={listPath}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="size-3.5" /> Back to payments
          </Link>
          <h1 className="text-xl font-semibold text-foreground">
            {attendee
              ? `${attendee.firstName} ${attendee.lastName}`
              : order?.fullName ?? 'Payment'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Payment details</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Payment</h2>
          <DetailRow label="Payment ID" value={payment.id} mono />
          <DetailRow label="Reference" value={payment.reference} mono />
          <DetailRow
            label="Amount"
            value={`${payment.currency === 'GBP' ? '£' : '₦'}${payment.amount}`}
            accent
          />
          <DetailRow
            label="Date"
            value={new Date(payment.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <StatusBadge status={payment.status} />
          </div>
          <div className="pt-1">
            <p className="text-xs text-muted-foreground mb-1">Receipt</p>
            {receiptUrl ? (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                View receipt <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Not submitted yet</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Receipt submitted ≠ successful payment. Status becomes Success only after verification.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Attendee</h2>
          {attendee ? (
            <>
              <DetailRow
                label="Name"
                value={`${attendee.firstName} ${attendee.lastName}`}
              />
              <DetailRow label="Email" value={attendee.email} />
              {(attendee.city || attendee.state || attendee.country) && (
                <DetailRow
                  label="Location"
                  value={[attendee.city, attendee.state, attendee.country]
                    .filter(Boolean)
                    .join(', ')}
                />
              )}
              {attendee.deliveryAddress && (
                <DetailRow label="Delivery address" value={attendee.deliveryAddress} />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No attendee linked.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Linked order</h2>
        {order ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow label="Customer" value={order.fullName} />
            <DetailRow label="Total" value={`£${order.totalPrice}`} accent />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Order status</p>
              <StatusBadge status={order.status} />
              <p className="text-xs text-muted-foreground mt-1">{formatStatusLabel(order.status)}</p>
            </div>
            {order.quantity != null && (
              <DetailRow label="Quantity" value={`${order.quantity} set(s)`} />
            )}
            {order.deliveryOption && (
              <DetailRow label="Delivery" value={order.deliveryOption} />
            )}
            <div className="sm:col-span-2">
              <Link
                to={`${ordersBase}/${order.id}`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Open order details →
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No order linked.</p>
        )}
      </section>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p
        className={
          accent
            ? 'text-sm font-medium text-amber-600'
            : mono
              ? 'text-sm text-foreground font-mono break-all'
              : 'text-sm text-foreground'
        }
      >
        {value}
      </p>
    </div>
  );
}
