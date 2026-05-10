'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ReportStats {
  totalSales: number
  totalPurchases: number
  totalEmployees: number
  totalGSTAmount: number
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalSales: 0,
    totalPurchases: 0,
    totalEmployees: 0,
    totalGSTAmount: 0,
  })
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const [salesRes, purchaseRes, employeeRes, gstRes] = await Promise.all([
            supabase
              .from('sales_entries')
              .select('total_amount')
              .eq('company_id', company.id)
              .gte('invoice_date', dateRange.startDate)
              .lte('invoice_date', dateRange.endDate),
            supabase
              .from('purchase_entries')
              .select('total_amount')
              .eq('company_id', company.id)
              .gte('bill_date', dateRange.startDate)
              .lte('bill_date', dateRange.endDate),
            supabase
              .from('employees')
              .select('*')
              .eq('company_id', company.id)
              .eq('status', 'Active'),
            supabase
              .from('gst_filings')
              .select('total_tax_amount'),
          ])

          setStats({
            totalSales: salesRes.data?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0,
            totalPurchases: purchaseRes.data?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0,
            totalEmployees: employeeRes.data?.length || 0,
            totalGSTAmount: gstRes.data?.reduce((sum, item) => sum + (item.total_tax_amount || 0), 0) || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching report stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase, dateRange])

  const reports = [
    {
      title: 'Income Statement',
      description: 'Summary of revenues and expenses',
      icon: '📊',
      type: 'financial',
    },
    {
      title: 'Balance Sheet',
      description: 'Assets, liabilities, and equity snapshot',
      icon: '⚖️',
      type: 'financial',
    },
    {
      title: 'GST Summary',
      description: 'GST tax summary and liabilities',
      icon: '🔢',
      type: 'tax',
    },
    {
      title: 'Payroll Report',
      description: 'Employee salary and tax summary',
      icon: '💵',
      type: 'payroll',
    },
    {
      title: 'Sales Report',
      description: 'Monthly and annual sales analysis',
      icon: '📈',
      type: 'sales',
    },
    {
      title: 'Purchase Report',
      description: 'Monthly and annual purchase analysis',
      icon: '📦',
      type: 'purchase',
    },
  ]

  const handleDownloadReport = (reportType: string) => {
    // Generate CSV content based on report type
    let csvContent = 'data:text/csv;charset=utf-8,'

    const headers = ['Report Type', 'Generated Date', 'Date Range', 'Total Amount']
    csvContent += headers.join(',') + '\n'
    csvContent += `${reportType},${new Date().toLocaleDateString()},${dateRange.startDate} to ${dateRange.endDate},`

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `${reportType.toLowerCase().replace(' ', '_')}_${dateRange.startDate}.csv`)
    link.click()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and view financial reports</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Sales</p>
          <p className="text-3xl font-bold text-blue-900">
            {loading ? '-' : `₹${(stats.totalSales / 100000).toFixed(2)}L`}
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Purchases</p>
          <p className="text-3xl font-bold text-orange-900">
            {loading ? '-' : `₹${(stats.totalPurchases / 100000).toFixed(2)}L`}
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-gray-600 text-sm font-medium mb-2">Active Employees</p>
          <p className="text-3xl font-bold text-green-900">{loading ? '-' : stats.totalEmployees}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-gray-600 text-sm font-medium mb-2">Total GST</p>
          <p className="text-3xl font-bold text-purple-900">
            {loading ? '-' : `₹${(stats.totalGSTAmount / 100000).toFixed(2)}L`}
          </p>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Period</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Reports Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.title} className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">{report.icon}</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h2>
              <p className="text-gray-600 text-sm mb-6">{report.description}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadReport(report.title)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <FileText size={18} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
