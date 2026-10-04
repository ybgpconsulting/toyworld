import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPageContent } from '../lib/api';

const formatTitle = (slug: string) => {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const PolicyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const pageSlug = slug || 'terms';
  const title = formatTitle(pageSlug);

  const { data, isLoading, error } = useQuery({
    queryKey: ['page', pageSlug],
    queryFn: () => getPageContent(pageSlug),
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[var(--brand-orange)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{title}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--deep-navy)] mb-8 border-b pb-4">
            {title}
          </h1>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mt-8"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : error || !data ? (
            <div className="text-center py-12 text-gray-500">
              Content for this page is currently being updated. Please check back later.
            </div>
          ) : (
            <div 
              className="prose prose-orange max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: data.content }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
