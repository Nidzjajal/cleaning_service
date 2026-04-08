'use client'

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Pending', class: 'badge-pending' },
  CONFIRMED: { label: 'Confirmed', class: 'badge-confirmed' },
  PROVIDER_ASSIGNED: { label: 'Provider Assigned', class: 'badge-confirmed' },
  ON_THE_WAY: { label: 'On the Way', class: 'badge-onway' },
  ARRIVED: { label: 'Arrived', class: 'badge-active' },
  IN_PROGRESS: { label: 'In Progress', class: 'badge-active' },
  COMPLETED: { label: 'Completed', class: 'badge-completed' },
  REVIEWED: { label: 'Reviewed', class: 'badge-completed' },
  CANCELLED: { label: 'Cancelled', class: 'badge-cancelled' },
  PAID: { label: 'Paid', class: 'badge-active' },
  REFUNDED: { label: 'Refunded', class: 'badge-cancelled' },
  FAILED: { label: 'Failed', class: 'badge-cancelled' },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, class: 'badge bg-gray-100 text-gray-600' }
  return <span className={config.class}>{config.label}</span>
}
