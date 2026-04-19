import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EditMedicine = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const response = await axios.get(`/api/medicines/${id}`);
        const medicine = response.data.medicine;
        
        // Set form values
        Object.keys(medicine).forEach(key => {
          if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
            setValue(key, medicine[key]);
          }
        });
      } catch (error) {
        toast.error('Failed to fetch medicine details');
        navigate('/medicines');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchMedicine();
  }, [id, navigate, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await axios.put(`/api/medicines/${id}`, data);
      toast.success('Medicine updated successfully');
      navigate('/medicines');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update medicine';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/medicines')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to Medicines</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Medicine</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Medicine Name *
              </label>
              <input
                {...register('name', { required: 'Medicine name is required' })}
                type="text"
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="Enter medicine name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Generic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Generic Name
              </label>
              <input
                {...register('genericName')}
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter generic name"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.category ? 'border-red-300' : ''
                }`}
              >
                <option value="">Select category</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Pain Relievers">Pain Relievers</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Cold & Flu">Cold & Flu</option>
                <option value="Allergy">Allergy</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Heart">Heart</option>
                <option value="Digestive">Digestive</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                {...register('brand')}
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter brand name"
              />
            </div>

            {/* Strength */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Strength
              </label>
              <input
                {...register('strength')}
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="e.g., 500mg, 10ml"
              />
            </div>

            {/* Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Form
              </label>
              <select
                {...register('form')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select form</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Liquid">Liquid</option>
                <option value="Cream">Cream</option>
                <option value="Ointment">Ointment</option>
                <option value="Injection">Injection</option>
                <option value="Inhaler">Inhaler</option>
              </select>
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit Price *
              </label>
              <input
                {...register('unitPrice', { 
                  required: 'Unit price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                type="number"
                step="0.01"
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.unitPrice ? 'border-red-300' : ''
                }`}
                placeholder="0.00"
              />
              {errors.unitPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.unitPrice.message}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Stock
              </label>
              <input
                {...register('stock', { 
                  min: { value: 0, message: 'Stock must be non-negative' }
                })}
                type="number"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>

            {/* Minimum Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Stock Alert
              </label>
              <input
                {...register('minStock', { 
                  min: { value: 0, message: 'Minimum stock must be non-negative' }
                })}
                type="number"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="10"
              />
              {errors.minStock && (
                <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>
              )}
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Manufacturer
              </label>
              <input
                {...register('manufacturer')}
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter manufacturer name"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Barcode
              </label>
              <input
                {...register('barcode')}
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter barcode"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                {...register('expiryDate')}
                type="date"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register('isActive')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter medicine description"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/medicines')}
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
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save size={16} />
                  <span>Update Medicine</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicine;
