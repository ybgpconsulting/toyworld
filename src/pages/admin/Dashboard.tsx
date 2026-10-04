import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../lib/api';
import { ShoppingBag, TrendingUp, DollarSign, PackageOpen } from 'lucide-react';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) return <div className="animate-pulse flex gap-4"><div className="h-32 flex-1 bg-gray-200 rounded-xl" /><div className="h-32 flex-1 bg-gray-200 rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--deep-navy)]">Dashboard Overview</h1>
        <select className="border-gray-300 rounded-lg text-sm bg-white p-2 border focus:outline-none">
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Orders</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--deep-navy)]">{stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">New Orders</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--deep-navy)]">{stats?.newOrders || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Revenue Today</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[var(--brand-orange)]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--deep-navy)]">₹{(stats?.revenueToday || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Revenue Month</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <PackageOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--deep-navy)]">₹{(stats?.revenueMonth || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders basic stub */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[var(--deep-navy)] mb-4">Recent Orders</h2>
          <div className="text-center py-8 text-gray-500">
            Order tracking table component goes here.
          </div>
        </div>

        {/* Low Stock basic stub */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[var(--deep-navy)] mb-4">Low Stock Alerts</h2>
          <div className="text-center py-8 text-gray-500">
            Low stock inventory table goes here.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
