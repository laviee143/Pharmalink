import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Package, Users, DollarSign, Download } from 'lucide-react';
import axios from 'axios';

const Reports = () => {
  const [dateRange, setDateRange] = useState('30'); // 30 days by default

  const { data: stats, isLoading: statsLoading } = useQuery(
    ['reports-stats', dateRange],
    async () => {
      const response = await axios.get(`/api/reports/stats?days=${dateRange}`);
      return response.data;
    }
  );

  const { data: salesData, isLoading: salesLoading } = useQuery(
    ['reports-sales', dateRange],
    async () => {
      const response = await axios.get(`/api/reports/sales?days=${dateRange}`);
      return response.data;
    }
  );

  const { data: topMedicines, isLoading: medicinesLoading } = useQuery(
    ['reports-medicines', dateRange],
    async () => {
      const response = await axios.get(`/api/reports/top-medicines?days=${dateRange}`);
      return response.data;
    }
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const statCards = [
    {
      title: 'Total Sales',
      value: stats?.totalSales || 0,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Prescriptions',
      value: stats?.totalPrescriptions || 0,
      icon: Package,
      color: 'bg-blue-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'New Customers',
      value: stats?.newCustomers || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Average Order Value',
      value: `$${stats?.avgOrderValue || 0}`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  if (statsLoading || salesLoading || medicinesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track your pharmacy performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp size={16} className="text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">from last period</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData?.sales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Medicines */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Medicines</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topMedicines?.medicines || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
              >
                {(topMedicines?.medicines || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Report */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats?.lowStock?.slice(0, 5).map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-xs text-gray-500">Current: {medicine.stock}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                    Low
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expiring Medicines */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Expiring Soon</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats?.expiring?.slice(0, 5).map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(medicine.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                    {Math.ceil((new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
