import React, { useState, useEffect } from 'react';
import { 
  adminGetHomepageBanners, 
  adminCreateHomepageBanner, 
  adminDeleteHomepageBanner,
  adminGetHomepageSections,
  adminUpdateHomepageSection,
  adminGetSettings,
  adminUpdateSettings,
  adminUpload
} from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Home, Plus, Trash2, Upload, Megaphone, Eye, EyeOff } from 'lucide-react';

const Homepage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const { showToast } = useToast();

  // Banner Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bannersRes, sectionsRes, settingsRes] = await Promise.all([
        adminGetHomepageBanners().catch(() => []),
        adminGetHomepageSections().catch(() => []),
        adminGetSettings().catch(() => ({} as Record<string, string>)),
      ]);
      setBanners(Array.isArray(bannersRes) ? bannersRes : []);
      setSections(Array.isArray(sectionsRes) ? sectionsRes : []);
      if ((settingsRes as Record<string, string>).announcement_bar_text) {
        setAnnouncementText((settingsRes as Record<string, string>).announcement_bar_text);
      }

    } catch (err: any) {
      showToast(err.message || 'Failed to load homepage config', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await adminUpdateSettings({ announcement_bar_text: announcementText });
      showToast('Announcement bar updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update announcement', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleSection = async (section: any) => {
    try {
      const newActive = !section.is_active;
      await adminUpdateHomepageSection(section.section_key, { is_active: newActive });
      setSections(sections.map((s) => (s.id === section.id ? { ...s, is_active: newActive } : s)));
      showToast(`Section "${section.title}" ${newActive ? 'enabled' : 'disabled'}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update section', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await adminUpload(file);
      setImageUrl(res.url);
      showToast('Banner image uploaded to R2', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSavingBanner(true);
      await adminCreateHomepageBanner({
        title,
        subtitle,
        cta_text: ctaText,
        cta_link: ctaLink,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200',
        display_order: banners.length + 1,
      });

      showToast('Hero banner created', 'success');
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setBannerModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create banner', 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await adminDeleteHomepageBanner(id);
      showToast('Banner deleted', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete banner', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
          <Home className="w-6 h-6 text-[var(--brand-orange)]" />
          Homepage Content & Layout
        </h1>
        <p className="text-sm text-gray-500">
          Control announcement headers, hero slides, and section ordering without coding
        </p>
      </div>

      {/* Announcement Bar */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[var(--deep-navy)] flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[var(--brand-orange)]" />
          Top Promotional Announcement Bar
        </h2>
        <form onSubmit={handleSaveAnnouncement} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. 🚚 Free Delivery on orders above ₹999 | Pan India Shipping!"
            className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--brand-orange)]"
          />
          <Button type="submit" variant="primary" loading={savingSettings}>
            Save Text
          </Button>
        </form>
      </div>

      {/* Hero Banners */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--deep-navy)]">
            Hero Carousel Banners ({banners.length})
          </h2>
          <Button variant="primary" size="sm" onClick={() => setBannerModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Slide
          </Button>
        </div>

        {banners.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No banners active. Add a slide above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="relative rounded-xl border overflow-hidden bg-gray-50 flex flex-col justify-between">
                <div className="h-36 overflow-hidden bg-gray-200">
                  {b.image_url && (
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-sm text-[var(--deep-navy)]">{b.title}</h3>
                  <p className="text-xs text-gray-500">{b.subtitle}</p>
                  <p className="text-xs text-[var(--brand-orange)] font-semibold mt-2">
                    CTA: {b.cta_text} → {b.cta_link}
                  </p>
                </div>
                <div className="p-3 border-t bg-white flex justify-end">
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Homepage Section Visibility */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[var(--deep-navy)]">
          Homepage Section Visibility
        </h2>
        <p className="text-xs text-gray-500">
          Toggle which shopping carousels and discovery modules appear on the customer homepage
        </p>

        <div className="divide-y">
          {sections.map((sec) => (
            <div key={sec.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[var(--deep-navy)]">{sec.title}</p>
                <p className="text-xs text-gray-400 font-mono">{sec.section_key}</p>
              </div>
              <button
                onClick={() => handleToggleSection(sec)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  sec.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {sec.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {sec.is_active ? 'Visible' : 'Hidden'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Banner Modal */}
      <Modal isOpen={bannerModalOpen} onClose={() => setBannerModalOpen(false)} title="Add Hero Slide">
        <form onSubmit={handleCreateBanner} className="space-y-4 pt-2">
          <Input
            label="Banner Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Explore a World of Toys!"
            required
          />
          <Input
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Educational, fun, and creative toys for all ages"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Button Text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Shop Now"
            />
            <Input
              label="Button Link"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="/shop or /category/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-sm font-medium">
                <Upload className="w-4 h-4" />
                {uploadingImage ? 'Uploading...' : 'Upload Image to R2'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {imageUrl && <span className="text-xs text-green-600 font-semibold">Image ready ✓</span>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setBannerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingBanner}>
              Save Slide
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Homepage;
