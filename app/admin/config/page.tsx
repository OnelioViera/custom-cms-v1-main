'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Settings } from 'lucide-react';

interface ConfigData {
  success: boolean;
  environment: string;
  isProduction: boolean;
  config: {
    MONGODB_URI: string;
    JWT_SECRET: string;
    CACHE_TTL_PAGES: number;
    CACHE_TTL_PROJECTS: number;
    CACHE_TTL_DEFAULT: number;
    RATE_LIMIT_LOGIN_MAX: number;
    RATE_LIMIT_LOGIN_WINDOW: number;
    RATE_LIMIT_UPLOAD_MAX: number;
    RATE_LIMIT_UPLOAD_WINDOW: number;
    RATE_LIMIT_API_MAX: number;
    RATE_LIMIT_API_WINDOW: number;
    [key: string]: unknown;
  };
  featureFlags: {
    caching: boolean;
    rateLimiting: boolean;
    monitoring: boolean;
    errorLogging: boolean;
  };
}

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const FeatureFlag = ({ name, enabled }: { name: string; enabled: boolean }) => (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
      <span className="font-medium">{name}</span>
      {enabled ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-gray-600 mt-1">System configuration and feature flags</p>
        </div>
        <Button variant="outline" onClick={fetchConfig}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Environment Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Environment</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Environment</p>
              <p className="text-lg font-semibold">{config.environment}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mode</p>
              <p className="text-lg font-semibold">
                {config.isProduction ? 'Production' : 'Development'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Required Secrets</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>MongoDB URI</span>
              <span className={config.config.MONGODB_URI === '***CONFIGURED***' ? 'text-green-600' : 'text-red-600'}>
                {config.config.MONGODB_URI}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>JWT Secret</span>
              <span className={config.config.JWT_SECRET === '***CONFIGURED***' ? 'text-green-600' : 'text-red-600'}>
                {config.config.JWT_SECRET}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-lg border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Feature Flags</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureFlag name="Caching" enabled={config.featureFlags.caching} />
            <FeatureFlag name="Rate Limiting" enabled={config.featureFlags.rateLimiting} />
            <FeatureFlag name="Monitoring" enabled={config.featureFlags.monitoring} />
            <FeatureFlag name="Error Logging" enabled={config.featureFlags.errorLogging} />
          </div>
        </div>
      </div>

      {/* Cache Settings */}
      <div className="bg-white rounded-lg border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Cache Settings</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pages TTL</p>
              <p className="text-2xl font-bold">{config.config.CACHE_TTL_PAGES}s</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Projects TTL</p>
              <p className="text-2xl font-bold">{config.config.CACHE_TTL_PROJECTS}s</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Default TTL</p>
              <p className="text-2xl font-bold">{config.config.CACHE_TTL_DEFAULT}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limiting Settings */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Rate Limiting</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Login Attempts</p>
              <p className="text-2xl font-bold">{config.config.RATE_LIMIT_LOGIN_MAX}</p>
              <p className="text-xs text-gray-500">per {config.config.RATE_LIMIT_LOGIN_WINDOW / 60000} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Upload Limit</p>
              <p className="text-2xl font-bold">{config.config.RATE_LIMIT_UPLOAD_MAX}</p>
              <p className="text-xs text-gray-500">per {config.config.RATE_LIMIT_UPLOAD_WINDOW / 3600000} hour</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">API Requests</p>
              <p className="text-2xl font-bold">{config.config.RATE_LIMIT_API_MAX}</p>
              <p className="text-xs text-gray-500">per {config.config.RATE_LIMIT_API_WINDOW / 60000} minute</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
