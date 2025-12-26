'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceMetric {
  name: string;
  count: number;
  avg: number;
  min: number;
  max: number;
  latest?: number;
}

interface ErrorSummary {
  total: number;
  last24Hours: number;
  lastHour: number;
  byLevel: {
    critical: number;
    error: number;
    warn: number;
    info: number;
  };
  recentCritical: Array<{
    id: string;
    message: string;
    level: string;
    timestamp: Date;
  }>;
}

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  level: string;
  timestamp: Date | string;
  context?: Record<string, unknown>;
}

interface MonitoringData {
  performance: {
    summary: PerformanceMetric[];
    recentMetrics: Array<{
      name: string;
      value: number;
      timestamp: Date | string;
    }>;
  };
  errors: {
    summary: ErrorSummary;
    recent: ErrorLog[];
  };
  system: {
    environment: string;
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
    };
  };
}

interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  totalSizeBytes: number;
  totalSizeMB: string;
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [monitoringResponse, cacheResponse] = await Promise.all([
        fetch('/api/admin/monitoring'),
        fetch('/api/admin/cache'),
      ]);

      const monitoringResult = await monitoringResponse.json();
      const cacheResult = await cacheResponse.json();

      if (monitoringResult.success) {
        setData(monitoringResult);
      }
      if (cacheResult.success) {
        setCacheStats(cacheResult.cache);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (!confirm('Are you sure you want to clear all monitoring data?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'DELETE',
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success('Monitoring data cleared');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to clear monitoring data');
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cache?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'DELETE',
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success('Cache cleared');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time system health and metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={clearData}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </Button>
        </div>
      </div>

      {/* System Info */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">System Status</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">Healthy</p>
          <p className="text-sm text-gray-600 mt-1">
            Environment: {data.system.environment}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-2">Uptime</h3>
          <p className="text-2xl font-bold">{formatUptime(data.system.uptime)}</p>
          <p className="text-sm text-gray-600 mt-1">Since last restart</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-2">Memory Usage</h3>
          <p className="text-2xl font-bold">
            {formatBytes(data.system.memory.heapUsed)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            of {formatBytes(data.system.memory.heapTotal)}
          </p>
        </div>

        {cacheStats && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">Cache</h3>
            <p className="text-2xl font-bold">{cacheStats.validEntries}</p>
            <p className="text-sm text-gray-600 mt-1">
              {cacheStats.totalSizeMB} MB ({cacheStats.expiredEntries} expired)
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCache}
              className="mt-3 w-full"
            >
              Clear Cache
            </Button>
          </div>
        )}
      </div>

      {/* Error Summary */}
      <div className="bg-white rounded-lg border mb-8">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold">Error Summary</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-2xl font-bold">{data.errors.summary.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last 24 Hours</p>
              <p className="text-2xl font-bold">{data.errors.summary.last24Hours}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Hour</p>
              <p className="text-2xl font-bold">{data.errors.summary.lastHour}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {data.errors.summary.byLevel.critical}
              </p>
            </div>
          </div>

          {data.errors.recent.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-3">Recent Errors</h3>
              <div className="space-y-2">
                {data.errors.recent.slice(0, 5).map((error: ErrorLog, i: number) => (
                  <div key={error.id || i} className="bg-gray-50 p-3 rounded border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{error.message}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {error.stack && (
                      <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                        {error.stack.split('\n')[0]}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No errors recorded</p>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Performance Metrics</h2>
        </div>
        <div className="p-6">
          {data.performance.summary.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No performance metrics recorded yet
            </p>
          ) : (
            <div className="space-y-4">
              {data.performance.summary.map((metric: PerformanceMetric, i: number) => (
                <div key={i} className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-sm text-gray-600">
                      {metric.count} calls
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Average</p>
                      <p className="font-semibold">{metric.avg.toFixed(2)}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Min</p>
                      <p className="font-semibold">{metric.min.toFixed(2)}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Max</p>
                      <p className="font-semibold">{metric.max.toFixed(2)}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Latest</p>
                      <p className="font-semibold">{metric.latest?.toFixed(2)}ms</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
