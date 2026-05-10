'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface BankStatement {
  id: string
  bank_name: string
  account_number: string
  statement_date: string
  transaction_type: string
  transaction_amount: number
  transaction_description: string
  reconciliation_status: string
}

export default function BankStatementsPage() {
  const [statements, setStatements] = useState<BankStatement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data, error } = await supabase
            .from('bank_statements')
            .select('*')
            .eq('company_id', company.id)
            .order('statement_date', { ascending: false })

          if (error) throw error
          setStatements(data || [])
        }
      } catch (error) {
        console.error('Error fetching bank statements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatements()
  }, [supabase])

  const filteredStatements = statements.filter((stmt) =>
    stmt.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stmt.account_number.includes(searchTerm)
  )

  const statusColors: Record<string, string> = {
    Reconciled: 'bg-green-100 text-green-800',
    Unreconciled: 'bg-yellow-100 text-yellow-800',
  }

  const typeColors: Record<string, string> = {
    Debit: 'text-red-600',
    Credit: 'text-green-600',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Statements</h1>
          <p className="text-gray-600 mt-2">Manage bank transactions and reconciliation</p>
        </div>
        <Link href="/accounting/bank/upload">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            Upload Statement
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by bank name or account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading bank statements...</div>
        ) : filteredStatements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No statements found matching your search.' : 'No bank statements yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Account</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStatements.map((stmt) => (
                  <tr key={stmt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{stmt.bank_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{stmt.account_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(stmt.statement_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{stmt.transaction_description}</td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${typeColors[stmt.transaction_type]}`}>
                      {stmt.transaction_type === 'Debit' ? '-' : '+'}₹{stmt.transaction_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[stmt.reconciliation_status]}`}>
                        {stmt.reconciliation_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
