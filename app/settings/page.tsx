'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface CompanySettings {
  id: string
  company_name: string
  email: string
  contact_number: string
  address: string
  city: string
  state: string
  pincode: string
  pan: string
  gst_number: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.log('[v0] Settings fetch error:', error)
        }

        if (data) {
          setSettings(data)
        } else {
          // Initialize with default values for new company
          setSettings({
            id: '',
            company_name: 'Anishi Services',
            email: 'sharabha9686@gmail.com',
            contact_number: '9686849914',
            address: '',
            city: '',
            state: '',
            pincode: '',
            pan: '',
            gst_number: '',
          })
        }
      } catch (err: any) {
        console.log('[v0] Error fetching settings:', err.message)
        // Initialize with defaults on error
        setSettings({
          id: '',
          company_name: 'Anishi Services',
          email: 'sharabha9686@gmail.com',
          contact_number: '9686849914',
          address: '',
          city: '',
          state: '',
          pincode: '',
          pan: '',
          gst_number: '',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) =>
      prev ? { ...prev, [name]: value } : null
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!settings) {
        throw new Error('No settings to save')
      }

      if (settings.id) {
        const { error } = await supabase
          .from('company_settings')
          .update(settings)
          .eq('id', settings.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert([settings])

        if (error) throw error
      }

      setSuccess('Settings saved successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage company information and configuration</p>
      </div>

      <Card className="p-8">
        {loading ? (
          <div className="text-center text-gray-500">Loading settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <Input
                    type="text"
                    name="company_name"
                    value={settings?.company_name || ''}
                    onChange={handleChange}
                    placeholder="Anishi Services"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={settings?.email || ''}
                    onChange={handleChange}
                    placeholder="sharabha9686@gmail.com"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <Input
                    type="tel"
                    name="contact_number"
                    value={settings?.contact_number || ''}
                    onChange={handleChange}
                    placeholder="9686849914"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <Input
                    type="text"
                    name="pan"
                    value={settings?.pan || ''}
                    onChange={handleChange}
                    placeholder="PAN number"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <Input
                    type="text"
                    name="gst_number"
                    value={settings?.gst_number || ''}
                    onChange={handleChange}
                    placeholder="GST number"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Input
                    type="text"
                    name="city"
                    value={settings?.city || ''}
                    onChange={handleChange}
                    placeholder="City"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Input
                    type="text"
                    name="state"
                    value={settings?.state || ''}
                    onChange={handleChange}
                    placeholder="State"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <Input
                    type="text"
                    name="pincode"
                    value={settings?.pincode || ''}
                    onChange={handleChange}
                    placeholder="Pincode"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Input
                  type="text"
                  name="address"
                  value={settings?.address || ''}
                  onChange={handleChange}
                  placeholder="Full address"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
