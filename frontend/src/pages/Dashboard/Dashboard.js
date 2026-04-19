import React from 'react';
import { useQuery } from 'react-query';
import { Package, Users, FileText, Receipt, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery(
    'dashboard-stats',
    async () => {
      const response = await axios.get('/api/dashboard/stats');
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: lowStockMedicines } = useQuery(
    'low-stock-medicines',
    async () => {
      const response = await axios.get('/api/medicines/reports/low-stock');
      return response.data;
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const { data: recentPrescriptions } = useQuery(
    'recent-prescriptions',
    async () => {
      const response = await axios.get('/api/prescriptions?limit=5');
      return response.data;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const statCards = [
    {
      title: 'Total Medicines',
      value: stats?.totalMedicines || 0,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Prescriptions Today',
      value: stats?.prescriptionsToday || 0,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Revenue Today',
      value: `$${stats?.revenueToday || 0}`,
      icon: Receipt,
      color: 'bg-yellow-500',
      change: '+20%',
      changeType: 'positive'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your pharmacy today.</p>
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
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
              </div>
            </div>
            <div className="p-6">
              {lowStockMedicines?.medicines?.length > 0 ? (
                <div className="space-y-3">
                  {lowStockMedicines.medicines.slice(0, 5).map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
                        <p className="text-xs text-gray-500">Stock: {medicine.stock}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                        Low
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No medicines with low stock</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h3>
            </div>
            <div className="p-6">
              {recentPrescriptions?.prescriptions?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prescription #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentPrescriptions.prescriptions.map((prescription) => (
                        <tr key={prescription.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {prescription.prescriptionNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {prescription.customer.firstName} {prescription.customer.lastName}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              prescription.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800'
                                : prescription.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {prescription.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ${prescription.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent prescriptions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
