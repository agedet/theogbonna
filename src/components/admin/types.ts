export const PAGE_SIZE = 6;

export const ORDER_STATUSES = [
  'new',
  'needs_review',
  'quoted',
  'awaiting_payment',
  'payment_proof_received',
  'payment_verified',
  'processing',
  'ready_for_dispatch',
  'assigned_to_delivery',
  'out_for_delivery',
  'delivered',
  'closed',
  'cancelled',
] as const;

export const PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED'] as const;

export interface Order {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  quantity: number;
  totalPrice: number;
  deliveryOption: string;
  deliveryAddress?: string | null;
  deliveryState?: string | null;
  paymentRef?: string | null;
  receiptUrl?: string | null;
  status: string;
  createdAt: string;
  attendees?: { firstName: string; lastName: string } | null;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  receiptUrl?: string | null;
  createdAt: string;
  attendees?: { firstName: string; lastName: string; email: string } | null;
  orders?: {
    id: string;
    fullName: string;
    totalPrice: number;
    receiptUrl?: string | null;
  } | null;
}

export interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  city: string;
  state: string;
  country: string;
  deliveryAddress: string;
  createdAt: string;
  _count?: { orders: number; transactions: number };
}

export interface AdminRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  role: 'admin' | 'super_admin';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface Stats {
  orders: { total: number; pending: number; confirmed: number };
  payments: { total: number; pending: number; success: number; revenue: number };
}

export function formatStatusLabel(status: string) {
  return status
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
