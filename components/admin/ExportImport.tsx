'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertCircle, CheckCircle, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { downloadJSON, generateExportFilename, validateImportData } from '@/lib/export';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExportImportProps {
  type: 'pages' | 'projects' | 'team' | 'services';
  apiEndpoint: string;
  requiredFields: string[];
  onImportComplete?: () => void;
}

export default function ExportImport({
  type,
  apiEndpoint,
  requiredFields,
  onImportComplete,
}: ExportImportProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<Record<string, unknown>[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading(`Exporting ${type}...`);

    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();

      if (data.success) {
        const items = data[type] || data.members || data.services || [];
        
        // Prepare export data (remove internal IDs, add metadata)
        const exportData = items.map((item: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id: _unusedId, createdAt: _unusedCreatedAt, updatedAt: _unusedUpdatedAt, createdBy: _unusedCreatedBy, ...rest } = item;
          return {
            ...rest,
            exportedAt: new Date().toISOString(),
          };
        });

        downloadJSON(
          {
            type,
            version: '1.0',
            exportedAt: new Date().toISOString(),
            count: exportData.length,
            data: exportData,
          },
          generateExportFilename(type)
        );

        toast.success(`Successfully exported ${exportData.length} ${type}`, {
          id: toastId,
        });
      } else {
        toast.error('Failed to export data', { id: toastId });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Validate structure
        if (!json.data || !Array.isArray(json.data)) {
          toast.error('Invalid import file structure');
          return;
        }

        // Validate required fields
        const validation = validateImportData(json.data, requiredFields);
        
        if (!validation.valid) {
          setImportErrors(validation.errors);
          toast.error(`Import validation failed: ${validation.errors.length} error(s)`);
        } else {
          setImportPreview(json.data);
          setImportErrors([]);
          toast.success(`Ready to import ${json.data.length} ${type}`);
        }
      } catch {
        toast.error('Failed to parse JSON file');
      }
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importPreview) return;

    setImporting(true);
    const toastId = toast.loading(`Importing ${importPreview.length} ${type}...`);

    try {
      let successCount = 0;
      let failCount = 0;

      for (const item of importPreview) {
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (failCount > 0) {
        toast.warning(
          `Imported ${successCount} ${type}, ${failCount} failed`,
          { id: toastId }
        );
      } else {
        toast.success(`Successfully imported ${successCount} ${type}`, {
          id: toastId,
        });
      }

      setImportPreview(null);
      onImportComplete?.();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data', { id: toastId });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
      >
        <Download className="w-4 h-4 mr-2" />
        {exporting ? 'Exporting...' : 'Export'}
      </Button>

      <label htmlFor={`import-${type}`} className="sr-only">
        Import {type} from JSON file
      </label>
      <input
        id={`import-${type}`}
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>

      {/* Import Preview Dialog */}
      <Dialog open={!!importPreview} onOpenChange={() => setImportPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              Review the data before importing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {importErrors.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Validation Errors
                </h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                  {importErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      Ready to import {importPreview?.length} {type}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-semibold mb-2">Preview:</h4>
                  <pre className="text-xs text-gray-700">
                    {JSON.stringify(importPreview?.slice(0, 3), null, 2)}
                    {(importPreview?.length || 0) > 3 && '\n... and more'}
                  </pre>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setImportPreview(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importing}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    {importing ? 'Importing...' : 'Confirm Import'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
