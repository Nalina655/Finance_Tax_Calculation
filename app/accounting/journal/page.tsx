'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface JournalEntry {
  id: string
  entry_number: string
  entry_date: string
  description: string
  account_head: string
  debit_amount: number | null
  credit_amount: number | null
  status: string
}

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('company_id', company.id)
            .order('entry_date', { ascending: false })

          if (error) throw error
          setEntries(data || [])
        }
      } catch (error) {
        console.error('Error fetching journal entries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [supabase])

  const filteredEntries = entries.filter((entry) =>
    entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.account_head.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Posted: 'bg-green-100 text-green-800',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600 mt-2">Manage journal entries and account heads</p>
        </div>
        <Link href="/accounting/journal/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            New Entry
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by entry number or account head..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading journal entries...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No entries found matching your search.' : 'No journal entries yet. Create your first entry.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Entry #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Account Head</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Debit</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Credit</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{entry.entry_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.account_head}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {entry.debit_amount ? `₹${entry.debit_amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {entry.credit_amount ? `₹${entry.credit_amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[entry.status]}`}>
                        {entry.status}
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
