import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { StatusBadge, formatStatusLabel, type Order } from '@/components/admin';
import { api } from '@/lib/api';

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listPath = location.pathname.startsWith('/super-admin')
    ? '/super-admin/orders'
    : '/admin/orders';
  const paymentsBase = location.pathname.startsWith('/super-admin')
    ? '/super-admin/payments'
    : '/admin/payments';

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<Order>(`/admin/orders/${id}`)
      .then(data => {
        if (!cancelled) setOrder(data);
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load order');
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

  if (error || !order) {
    return (
      <div className="p-6 space-y-4">
        <Link to={listPath} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
        <p className="text-sm text-red-500">{error ?? 'Order not found.'}</p>
      </div>
    );
  }

  const attendee = order.attendees;
  const payment = order.transactions?.[0];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <Link
            to={listPath}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="size-3.5" /> Back to orders
          </Link>
          <h1 className="text-xl font-semibold text-foreground">{order.fullName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Order details</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Order</h2>
          <DetailRow label="Order ID" value={order.id} mono />
          <DetailRow
            label="Date"
            value={new Date(order.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
          <DetailRow label="Status" value={formatStatusLabel(order.status)} />
          <DetailRow label="Quantity" value={`${order.quantity} set(s)`} />
          <DetailRow label="Total" value={`£${order.totalPrice}`} accent />
          <DetailRow label="Delivery" value={order.deliveryOption} />
          {order.deliveryAddress && (
            <DetailRow
              label="Address"
              value={[order.deliveryAddress, order.deliveryState].filter(Boolean).join(', ')}
            />
          )}
          <DetailRow label="Payment ref" value={order.paymentRef ?? '—'} mono />
          <div className="pt-1">
            <p className="text-xs text-muted-foreground mb-1">Receipt</p>
            {order.receiptUrl ? (
              <a
                href={order.receiptUrl}
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
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Attendee</h2>
          {attendee ? (
            <>
              <DetailRow
                label="Name"
                value={`${attendee.firstName} ${attendee.lastName}`}
              />
              <DetailRow label="Email" value={order.email} />
              <DetailRow label="Phone" value={order.phone} />
            </>
          ) : (
            <>
              <DetailRow label="Name" value={order.fullName} />
              <DetailRow label="Email" value={order.email} />
              <DetailRow label="Phone" value={order.phone} />
            </>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Payment</h2>
        {payment ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow label="Reference" value={payment.reference} mono />
            <DetailRow
              label="Amount"
              value={`${payment.currency === 'GBP' ? '£' : '₦'}${payment.amount}`}
              accent
            />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Payment status</p>
              <StatusBadge status={payment.status} />
            </div>
            <div className="flex items-end">
              <Link
                to={`${paymentsBase}/${payment.id}`}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Open payment details →
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No payment record yet.</p>
        )}
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          A receipt upload means proof was submitted — payment is only successful after verification.
        </p>
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
