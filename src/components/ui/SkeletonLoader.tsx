import React from 'react';
import clsx from 'clsx';

export const ProductCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-3 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-9 bg-gray-200 rounded-xl w-full" />
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-2xl" />
      <div className="w-full md:w-1/2 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="space-y-2 mt-8">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-full mt-8" />
      </div>
    </div>
  </div>
);
