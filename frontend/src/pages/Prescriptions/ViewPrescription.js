import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, FileText, User, Calendar, DollarSign, Package } from 'lucide-react';
import axios from 'axios';

const ViewPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    ['prescription', id],
    async () => {
      const response = await axios.get(`/api/prescriptions/${id}`);
      return response.data;
    }
  );

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`/api/prescriptions/${id}/status`, { status: newStatus });
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const prescription = data?.prescription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/prescriptions')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Prescriptions</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Details</h1>
        </div>
        
        {/* Status Actions */}
        <div className="flex space-x-2">
          {prescription?.status === 'PENDING' && (
            <button
              onClick={() => handleStatusUpdate('PROCESSING')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Processing
            </button>
          )}
          {prescription?.status === 'PROCESSING' && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Complete
            </button>
          )}
          {prescription?.status !== 'CANCELLED' && prescription?.status !== 'COMPLETED' && (
            <button
              onClick={() => handleStatusUpdate('CANCELLED')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Prescription Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              {prescription?.prescriptionNumber}
            </h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              prescription?.status === 'COMPLETED' 
                ? 'bg-green-100 text-green-800'
                : prescription?.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : prescription?.status === 'PROCESSING'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {prescription?.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Info */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <User size={16} />
                <span>Customer</span>
              </div>
              <p className="text-gray-900 font-medium">
                {prescription?.customer.firstName} {prescription?.customer.lastName}
              </p>
              <p className="text-sm text-gray-600">{prescription?.customer.phone}</p>
            </div>

            {/* Pharmacist Info */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <User size={16} />
                <span>Pharmacist</span>
              </div>
              <p className="text-gray-900 font-medium">
                {prescription?.pharmacist.firstName} {prescription?.pharmacist.lastName}
              </p>
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <Calendar size={16} />
                <span>Date</span>
              </div>
              <p className="text-gray-900 font-medium">
                {new Date(prescription?.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Total Amount */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <DollarSign size={16} />
                <span>Total Amount</span>
              </div>
              <p className="text-gray-900 font-medium">
                ${prescription?.totalAmount?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        {(prescription?.doctorName || prescription?.diagnosis) && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prescription?.doctorName && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Doctor</p>
                  <p className="text-gray-900 font-medium">{prescription.doctorName}</p>
                </div>
              )}
              {prescription?.diagnosis && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                  <p className="text-gray-900 font-medium">{prescription.diagnosis}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicines */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Medicines</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prescription?.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="text-gray-400 mr-3" size={20} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.medicine.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.medicine.genericName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dosage || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.instructions || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {prescription?.notes && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-700">{prescription.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPrescription;
