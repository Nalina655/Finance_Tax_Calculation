'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, DollarSign, FileText, Users, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalSales: number
  totalPurchases: number
  pendingInvoices: number
  activeEmployees: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalPurchases: 0,
    pendingInvoices: 0,
    activeEmployees: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salesRes, purchaseRes, invoiceRes, employeeRes] = await Promise.all([
          supabase.from('sales_entries').select('total_amount').limit(100),
          supabase.from('purchase_entries').select('total_amount').limit(100),
          supabase.from('sales_entries').select('*').eq('payment_status', 'Unpaid').limit(100),
          supabase.from('employees').select('*').eq('status', 'Active').limit(100),
        ])

        setStats({
          totalSales: salesRes.data?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0,
          totalPurchases: purchaseRes.data?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0,
          pendingInvoices: invoiceRes.data?.length || 0,
          activeEmployees: employeeRes.data?.length || 0,
        })
      } catch (error) {
        console.log('[v0] Stats fetch error (expected if no data yet):', error)
        // Stats will show 0 if there's no data, which is fine for new users
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    {
      title: 'Total Sales',
      value: `₹${(stats.totalSales / 100000).toFixed(2)}L`,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      href: '/accounting/sales',
    },
    {
      title: 'Total Purchases',
      value: `₹${(stats.totalPurchases / 100000).toFixed(2)}L`,
      icon: DollarSign,
      color: 'bg-blue-100 text-blue-600',
      href: '/accounting/purchases',
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices.toString(),
      icon: FileText,
      color: 'bg-yellow-100 text-yellow-600',
      href: '/accounting/sales',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees.toString(),
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      href: '/payroll/employees',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to Anishi Services Accounting Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accounting</h2>
          <div className="space-y-3">
            <Link
              href="/accounting/sales/new"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Create Sales Invoice</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/accounting/purchases/new"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Create Purchase Bill</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/accounting/bank"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Bank Reconciliation</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">GST & Tax</h2>
          <div className="space-y-3">
            <Link
              href="/gst/registration"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">GST Registration</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/gst/filings"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">GST Filings</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/payroll/tax"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Employee Tax Records</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payroll & Reports</h2>
          <div className="space-y-3">
            <Link
              href="/payroll/employees"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Employee Management</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/payroll/records"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Payroll Records</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/reports"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">View Reports</span>
              <ArrowRight size={20} className="text-gray-400" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
