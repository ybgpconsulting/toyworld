import React, { useState, useEffect } from 'react';
import { adminGetReviews, adminApproveReview, adminRejectReview, adminDeleteReview } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import type { Review } from '../../types';
import Button from '../../components/ui/Button';

import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import { MessageSquare, Check, X, Trash2 } from 'lucide-react';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const { showToast } = useToast();

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await adminGetReviews(activeTab === 'all' ? undefined : activeTab);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    try {
      await adminApproveReview(id);
      showToast('Review approved and published', 'success');
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve review', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await adminRejectReview(id);
      showToast('Review hidden / rejected', 'success');
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject review', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await adminDeleteReview(id);
      showToast('Review deleted', 'success');
      loadReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--deep-navy)] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[var(--brand-orange)]" />
            Customer Reviews Moderation
          </h1>
          <p className="text-sm text-gray-500">
            Moderate and verify authentic customer feedback before displaying on product pages
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-[var(--brand-orange)] text-[var(--brand-orange)]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Moderation
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'approved'
              ? 'border-[var(--brand-orange)] text-[var(--brand-orange)]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved & Live
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-[var(--brand-orange)] text-[var(--brand-orange)]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Reviews
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No {activeTab} reviews found.</div>
        ) : (
          <div className="divide-y">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--deep-navy)]">
                      {rev.customer_name}
                    </span>
                    <Badge variant={rev.is_approved ? 'success' : 'warning'}>
                      {rev.is_approved ? 'Live' : 'Pending'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--brand-orange)] font-medium">
                    Product: {rev.product_name || `ID #${rev.product_id}`}
                  </p>

                  <div className="flex items-center gap-2">
                    <StarRating rating={rev.rating} maxRating={5} size="sm" />
                    {rev.title && <span className="font-semibold text-sm">{rev.title}</span>}
                  </div>

                  {rev.body && <p className="text-sm text-gray-600 italic">"{rev.body}"</p>}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!rev.is_approved && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(rev.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  )}
                  {rev.is_approved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(rev.id)}
                    >
                      <X className="w-4 h-4 mr-1" /> Hide
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
