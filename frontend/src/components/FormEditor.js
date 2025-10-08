import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEditing) {
      fetchForm();
    }
  }, [id, isEditing]);

  const fetchForm = async () => {
    try {
      const response = await axios.get(`/forms/${id}`);
      const form = response.data.form;
      
      // Populate form fields
      Object.keys(form).forEach(key => {
        setValue(key, form[key]);
      });
    } catch (error) {
      toast.error('Failed to fetch form');
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      if (isEditing) {
        await axios.put(`/forms/${id}`, data);
        toast.success('Form updated successfully');
      } else {
        const response = await axios.post('/forms', data);
        toast.success('Form created successfully');
        navigate(`/forms/${response.data.form.id}/edit`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  const generateForm = async () => {
    if (!id) {
      toast.error('Please save the form first');
      return;
    }

    setGenerating(true);
    
    try {
      const response = await axios.post(`/generate/form/${id}`);
      toast.success('Form generated successfully!');
      
      // Optionally open generated form in new tab
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate form');
    } finally {
      setGenerating(false);
    }
  };

  // Parse WebinarFuel URL
  const webinarFuelUrl = watch('webinar_fuel_url');
  const parseUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/widgets\/(\d+)\/(\d+)\/elements/);
    return match ? { widgetId: match[1], version: match[2] } : null;
  };

  const urlParsed = parseUrl(webinarFuelUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600">
            Configure your Infusionsoft and WebinarFuel integration
          </p>
        </div>
        {isEditing && (
          <button
            onClick={generateForm}
            disabled={generating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Form'}
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Form Name
                </label>
                <input
                  {...register('name', { required: 'Form name is required' })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                  placeholder="e.g., AI Webinar Registration"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              WebinarFuel Configuration
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  WebinarFuel Widget URL
                </label>
                <input
                  {...register('webinar_fuel_url')}
                  type="url"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                  placeholder="https://app.webinarfuel.com/webinars/.../widgets/.../elements"
                />
                {urlParsed && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      ✓ Parsed: Widget ID <strong>{urlParsed.widgetId}</strong>, Version <strong>{urlParsed.version}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Session ID
                  </label>
                  <input
                    {...register('session_id', { required: 'Session ID is required' })}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                  />
                  {errors.session_id && (
                    <p className="mt-2 text-sm text-red-600">{errors.session_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Widget ID
                  </label>
                  <input
                    {...register('widget_id', { required: 'Widget ID is required' })}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                    value={urlParsed?.widgetId || ''}
                  />
                  {errors.widget_id && (
                    <p className="mt-2 text-sm text-red-600">{errors.widget_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Widget Version
                  </label>
                  <input
                    {...register('widget_version', { required: 'Widget version is required' })}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                    value={urlParsed?.version || ''}
                  />
                  {errors.widget_version && (
                    <p className="mt-2 text-sm text-red-600">{errors.widget_version.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Infusionsoft Form HTML
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste your Infusionsoft form HTML
              </label>
              <textarea
                {...register('infusionsoft_html', { required: 'Infusionsoft HTML is required' })}
                rows={12}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 font-mono text-sm"
                placeholder="<form action='https://....infusionsoft.com/app/form/process/...' method='POST'>..."
              />
              {errors.infusionsoft_html && (
                <p className="mt-2 text-sm text-red-600">{errors.infusionsoft_html.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Copy and paste the complete form HTML from your Infusionsoft form builder.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Form' : 'Create Form'}
          </button>
        </div>
      </form>
    </div>
  );
}