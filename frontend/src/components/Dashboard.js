import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, EditIcon, TrashIcon, DownloadIcon, EyeIcon } from 'lucide-react';

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get('/forms');
      setForms(response.data.forms);
    } catch (error) {
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await axios.delete(`/forms/${id}`);
      toast.success('Form deleted successfully');
      fetchForms();
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      generated: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your webinar registration forms</p>
        </div>
        <Link
          to="/forms/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New Form
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Forms', value: forms.length, color: 'blue' },
          { label: 'Generated', value: forms.filter(f => f.status === 'generated').length, color: 'green' },
          { label: 'Draft', value: forms.filter(f => f.status === 'draft').length, color: 'yellow' },
          { label: 'Active', value: forms.filter(f => f.status === 'active').length, color: 'purple' }
        ].map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 bg-${stat.color}-500 rounded-md flex items-center justify-center`}>
                    <span className="text-white font-bold">{stat.value}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Forms</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your webinar registration forms and their current status.
          </p>
        </div>
        {forms.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forms yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first webinar registration form.</p>
            <div className="mt-6">
              <Link
                to="/forms/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Form
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {forms.map((form) => (
              <li key={form.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{form.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Widget ID: {form.widget_id}</span>
                      <span>Session: {form.session_id}</span>
                      <span>Updated: {formatDate(form.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/forms/${form.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Link>
                    {form.generated_filename && (
                      <a
                        href={`/forms/${form.generated_filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Generated Form"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                    )}
                    {form.generated_filename && (
                      <a
                        href={`/api/generate/form/${form.generated_filename}`}
                        download
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteForm(form.id, form.name)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}