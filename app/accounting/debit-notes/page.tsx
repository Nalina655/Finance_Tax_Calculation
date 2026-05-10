'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface DebitNote {
  id: string
  debit_note_number: string
  debit_note_date: string
  vendor_name: string
  total_amount: number
  status: string
}

export default function DebitNotesPage() {
  const [notes, setNotes] = useState<DebitNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data, error } = await supabase
            .from('debit_notes')
            .select('*')
            .eq('company_id', company.id)
            .order('debit_note_date', { ascending: false })

          if (error) throw error
          setNotes(data || [])
        }
      } catch (error) {
        console.error('Error fetching debit notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [supabase])

  const filteredNotes = notes.filter((note) =>
    note.debit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    Issued: 'bg-blue-100 text-blue-800',
    Adjusted: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debit Notes</h1>
          <p className="text-gray-600 mt-2">Manage debit notes for vendor claims</p>
        </div>
        <Link href="/accounting/debit-notes/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            New Debit Note
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by note number or vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading debit notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No debit notes found matching your search.' : 'No debit notes yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Note #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{note.debit_note_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(note.debit_note_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{note.vendor_name}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{note.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[note.status]}`}>
                        {note.status}
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
