'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccountingPage() {
  const modules = [
    {
      title: 'Sales Entries',
      description: 'Manage sales invoices and transactions',
      color: 'bg-green-50 border-green-200',
      icon: '📊',
      actions: [
        { label: 'New Sales Invoice', href: '/accounting/sales/new', icon: Plus },
        { label: 'View All', href: '/accounting/sales', icon: Eye },
      ],
    },
    {
      title: 'Purchase Entries',
      description: 'Manage purchase bills and receipts',
      color: 'bg-blue-50 border-blue-200',
      icon: '📦',
      actions: [
        { label: 'New Purchase Bill', href: '/accounting/purchases/new', icon: Plus },
        { label: 'View All', href: '/accounting/purchases', icon: Eye },
      ],
    },
    {
      title: 'Credit Notes',
      description: 'Manage credit notes for customer returns',
      color: 'bg-purple-50 border-purple-200',
      icon: '📝',
      actions: [
        { label: 'New Credit Note', href: '/accounting/credit-notes/new', icon: Plus },
        { label: 'View All', href: '/accounting/credit-notes', icon: Eye },
      ],
    },
    {
      title: 'Debit Notes',
      description: 'Manage debit notes for vendor claims',
      color: 'bg-orange-50 border-orange-200',
      icon: '📋',
      actions: [
        { label: 'New Debit Note', href: '/accounting/debit-notes/new', icon: Plus },
        { label: 'View All', href: '/accounting/debit-notes', icon: Eye },
      ],
    },
    {
      title: 'Bank Statements',
      description: 'Upload and reconcile bank statements',
      color: 'bg-indigo-50 border-indigo-200',
      icon: '🏦',
      actions: [
        { label: 'Upload Statement', href: '/accounting/bank/upload', icon: Plus },
        { label: 'View All', href: '/accounting/bank', icon: Eye },
      ],
    },
    {
      title: 'Journal Entries',
      description: 'Create and manage journal entries',
      color: 'bg-pink-50 border-pink-200',
      icon: '📖',
      actions: [
        { label: 'New Entry', href: '/accounting/journal/new', icon: Plus },
        { label: 'View All', href: '/accounting/journal', icon: Eye },
      ],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Accounting</h1>
        <p className="text-gray-600">Manage all your accounting entries and records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.title} className={`p-6 border ${module.color}`}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
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
