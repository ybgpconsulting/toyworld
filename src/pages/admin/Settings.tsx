import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminUpdateSettings } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Settings as SettingsIcon, Save, Store, Share2, FileSpreadsheet } from 'lucide-react';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    store_name: 'TOY WORLD',
    store_tagline: 'Where Every Child Finds Joy',
    store_phone: '9416217374',
    store_whatsapp: '9416217374',
    store_email: 'contact@toyworld.in',
    store_address: '123 Market Road, Main Bazar',
    store_city: 'Hisar',
    store_state: 'Haryana',
    store_pincode: '125001',
    business_hours: 'Mon-Sat: 10am-8pm | Sun: 11am-6pm',
    about_text: 'TOY WORLD is your trusted destination for quality toys across India.',
    whatsapp_cta_text: 'Chat with us on WhatsApp for instant assistance!',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    google_sheets_url: '',
    min_order_value: '0',
  });

  useEffect(() => {
    adminGetSettings()
      .then((data) => {
        if (data && typeof data === 'object') {
          setForm((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminUpdateSettings(form);
      showToast('Store settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[var(--brand-orange)]" />
          Store Profile & Integrations
        </h1>
        <p className="text-sm text-gray-500">
          Configure business details, WhatsApp support phone, social links, and Google Sheets synchronization
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <Store className="w-5 h-5 text-[var(--brand-orange)]" />
            Showroom & Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Store Name *"
              value={form.store_name}
              onChange={(e) => handleChange('store_name', e.target.value)}
              required
            />
            <Input
              label="Tagline"
              value={form.store_tagline}
              onChange={(e) => handleChange('store_tagline', e.target.value)}
            />
            <Input
              label="WhatsApp Phone (Orders) *"
              value={form.store_whatsapp}
              onChange={(e) => handleChange('store_whatsapp', e.target.value)}
              placeholder="9416217374"
              required
            />
            <Input
              label="Calling Phone"
              value={form.store_phone}
              onChange={(e) => handleChange('store_phone', e.target.value)}
              placeholder="9416217374"
            />
            <Input
              label="Support Email"
              type="email"
              value={form.store_email}
              onChange={(e) => handleChange('store_email', e.target.value)}
            />
            <Input
              label="Business Hours"
              value={form.business_hours}
              onChange={(e) => handleChange('business_hours', e.target.value)}
              placeholder="Mon-Sat: 10am-8pm"
            />
          </div>

          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Input
                label="Street Address"
                value={form.store_address}
                onChange={(e) => handleChange('store_address', e.target.value)}
              />
            </div>
            <Input
              label="City"
              value={form.store_city}
              onChange={(e) => handleChange('store_city', e.target.value)}
            />
            <Input
              label="State"
              value={form.store_state}
              onChange={(e) => handleChange('store_state', e.target.value)}
            />
            <Input
              label="Pincode"
              value={form.store_pincode}
              onChange={(e) => handleChange('store_pincode', e.target.value)}
            />
          </div>
        </div>

        {/* Google Sheets Integration */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Google Sheets Operational Synchronization
          </h2>
          <p className="text-xs text-gray-500">
            Paste the deployed Google Apps Script Web App URL below to automatically stream placed orders to staff spreadsheets in real time.
          </p>

          <Input
            label="Google Apps Script Web App URL"
            value={form.google_sheets_url}
            onChange={(e) => handleChange('google_sheets_url', e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
          />
        </div>

        {/* Social Media & WhatsApp CTA */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--brand-orange)]" />
            Social Media & WhatsApp Message Text
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Instagram URL"
              value={form.instagram_url}
              onChange={(e) => handleChange('instagram_url', e.target.value)}
              placeholder="https://instagram.com/toyworld"
            />
            <Input
              label="Facebook URL"
              value={form.facebook_url}
              onChange={(e) => handleChange('facebook_url', e.target.value)}
              placeholder="https://facebook.com/toyworld"
            />
            <Input
              label="YouTube URL"
              value={form.youtube_url}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
              placeholder="https://youtube.com/@toyworld"
            />
          </div>

          <div>
            <Input
              label="WhatsApp Floating CTA Text"
              value={form.whatsapp_cta_text}
              onChange={(e) => handleChange('whatsapp_cta_text', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" loading={saving} size="lg">
            <Save className="w-5 h-5 mr-1.5" /> Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
