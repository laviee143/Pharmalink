import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Receipt, User, Calendar, DollarSign, Package } from 'lucide-react';
import axios from 'axios';

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    ['invoice', id],
    async () => {
      const response = await axios.get(`/api/invoices/${id}`);
      return response.data;
    }
  );

  const handlePaymentStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`/api/invoices/${id}/payment-status`, { paymentStatus: newStatus });
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const invoice = data?.invoice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/invoices')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Invoices</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
        </div>
        
        {/* Payment Status Actions */}
        <div className="flex space-x-2">
          {invoice?.paymentStatus === 'PENDING' && (
            <button
              onClick={() => handlePaymentStatusUpdate('PAID')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Mark as Paid
            </button>
          )}
          {invoice?.paymentStatus === 'PAID' && (
            <button
              onClick={() => handlePaymentStatusUpdate('REFUNDED')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Refund
            </button>
          )}
        </div>
      </div>

      {/* Invoice Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Receipt className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              {invoice?.invoiceNumber}
            </h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              invoice?.paymentStatus === 'PAID' 
                ? 'bg-green-100 text-green-800'
                : invoice?.paymentStatus === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : invoice?.paymentStatus === 'PARTIALLY_PAID'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {invoice?.paymentStatus.replace('_', ' ')}
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
                {invoice?.customer.firstName} {invoice?.customer.lastName}
              </p>
              <p className="text-sm text-gray-600">{invoice?.customer.phone}</p>
            </div>

            {/* Pharmacist Info */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <User size={16} />
                <span>Pharmacist</span>
              </div>
              <p className="text-gray-900 font-medium">
                {invoice?.pharmacist.firstName} {invoice?.pharmacist.lastName}
              </p>
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <Calendar size={16} />
                <span>Date</span>
              </div>
              <p className="text-gray-900 font-medium">
                {new Date(invoice?.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <DollarSign size={16} />
                <span>Payment Method</span>
              </div>
              <p className="text-gray-900 font-medium">
                {invoice?.paymentMethod.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
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
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice?.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="text-gray-400 mr-3" size={20} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.medicine.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {/* Prescription Info */}
              {invoice?.prescription && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Related Prescription</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      {invoice.prescription.prescriptionNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(invoice.prescription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {invoice?.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Summary</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoice?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${invoice?.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${invoice?.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
