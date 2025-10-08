import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user, updateBearerToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      bearer_token: user?.bearer_token || ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateBearerToken(data.bearer_token);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and WebinarFuel configuration
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Account Information
          </h3>
          
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* WebinarFuel Settings */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            WebinarFuel Configuration
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="bearer_token" className="block text-sm font-medium text-gray-700">
                Bearer Token
              </label>
              <div className="mt-1">
                <input
                  {...register('bearer_token', { 
                    required: 'Bearer token is required',
                    minLength: { value: 10, message: 'Bearer token seems too short' }
                  })}
                  type="password"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Enter your WebinarFuel Bearer Token"
                />
                {errors.bearer_token && (
                  <p className="mt-2 text-sm text-red-600">{errors.bearer_token.message}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Your WebinarFuel API Bearer Token. This will be used for all form generations.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          How to find your Bearer Token
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Log into your WebinarFuel account</li>
          <li>Go to Settings → API Settings</li>
          <li>Generate or copy your Bearer Token</li>
          <li>Paste it in the field above</li>
        </ol>
      </div>
    </div>
  );
}