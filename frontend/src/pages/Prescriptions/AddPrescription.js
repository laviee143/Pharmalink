import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
import { useQuery } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddPrescription = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchMedicine, setSearchMedicine] = useState('');

  const { data: customers } = useQuery('customers', async () => {
    const response = await axios.get('/api/customers?limit=100');
    return response.data.customers;
  });

  const { data: medicines } = useQuery('medicines', async () => {
    const response = await axios.get('/api/medicines?limit=100');
    return response.data.medicines;
  });

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      items: [{ medicineId: '', quantity: 1, price: 0, dosage: '', instructions: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/prescriptions', data);
      toast.success('Prescription created successfully');
      navigate('/prescriptions');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create prescription';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    append({ medicineId: '', quantity: 1, price: 0, dosage: '', instructions: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/prescriptions')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to Prescriptions</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer *
              </label>
              <select
                {...register('customerId', { required: 'Customer is required' })}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.customerId ? 'border-red-300' : ''
                }`}
              >
                <option value="">Select customer</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
              )}
            </div>

            {/* Doctor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor Name
              </label>
              <input
                {...register('doctorName')}
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter doctor name"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Diagnosis
              </label>
              <input
                {...register('diagnosis')}
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter diagnosis"
              />
            </div>
          </div>

          {/* Prescription Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Medicines</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Plus size={20} />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Medicine */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Medicine *
                      </label>
                      <select
                        {...register(`items.${index}.medicineId`, { required: 'Medicine is required' })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="">Select medicine</option>
                        {medicines?.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.name} - ${medicine.unitPrice}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity *
                      </label>
                      <input
                        {...register(`items.${index}.quantity`, { 
                          required: 'Quantity is required',
                          min: { value: 1, message: 'Quantity must be at least 1' }
                        })}
                        type="number"
                        min="1"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="1"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Price *
                      </label>
                      <input
                        {...register(`items.${index}.price`, { 
                          required: 'Price is required',
                          min: { value: 0, message: 'Price must be positive' }
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-end">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Dosage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dosage
                      </label>
                      <input
                        {...register(`items.${index}.dosage`)}
                        type="text"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="e.g., 1 tablet twice daily"
                      />
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Instructions
                      </label>
                      <input
                        {...register(`items.${index}.instructions`)}
                        type="text"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="e.g., Take with food"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter any additional notes"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/prescriptions')}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save size={16} />
                  <span>Create Prescription</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrescription;
