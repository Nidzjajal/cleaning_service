'use client'
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout'

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CustomerDashboardLayout>
      {children}
    </CustomerDashboardLayout>
  )
}
