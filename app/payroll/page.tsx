'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PayrollPage() {
  const modules = [
    {
      title: 'Employees',
      description: 'Manage employee information and records',
      icon: '👥',
      actions: [
        { label: 'Add Employee', href: '/payroll/employees/new', icon: Plus },
        { label: 'View All', href: '/payroll/employees', icon: Eye },
      ],
    },
    {
      title: 'Payroll Records',
      description: 'Process monthly payroll and salary',
      icon: '💰',
      actions: [
        { label: 'New Payroll', href: '/payroll/records/new', icon: Plus },
        { label: 'View All', href: '/payroll/records', icon: Eye },
      ],
    },
    {
      title: 'Employee Tax',
      description: 'Manage TDS, PF, ESI, and PT',
      icon: '📊',
      actions: [
        { label: 'Add Tax Record', href: '/payroll/tax/new', icon: Plus },
        { label: 'View All', href: '/payroll/tax', icon: Eye },
      ],
    },
    {
      title: 'Tax Filings',
      description: 'File employee tax returns',
      icon: '📋',
      actions: [
        { label: 'File Return', href: '/payroll/filings/new', icon: Plus },
        { label: 'View All', href: '/payroll/filings', icon: Eye },
      ],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payroll Management</h1>
        <p className="text-gray-600">Manage employees, salaries, and tax filings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.title} className="p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-3xl mb-2">{module.icon}</div>
                <h2 className="text-xl font-bold text-gray-900">{module.title}</h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">{module.description}</p>
            <div className="flex gap-2">
              {module.actions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="hidden sm:inline">{action.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
