export function downloadJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateExportFilename(type: string): string {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().getTime();
  return `${type}-export-${date}-${timestamp}.json`;
}

export function prepareExportData(items: any[]) {
  // Remove MongoDB-specific fields and prepare for export
  return items.map(item => {
    const { _id, createdAt, updatedAt, ...rest } = item;
    return {
      ...rest,
      exportedAt: new Date().toISOString(),
    };
  });
}

export function validateImportData(data: any[], requiredFields: string[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Import data must be an array');
    return { valid: false, errors };
  }

  data.forEach((item, index) => {
    requiredFields.forEach(field => {
      if (!item[field]) {
        errors.push(`Item ${index + 1}: Missing required field "${field}"`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
