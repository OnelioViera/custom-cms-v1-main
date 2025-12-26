export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateField(
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null {
  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    return `${fieldName} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return null;
  }

  const stringValue = value.toString();

  // Min length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }

  // Max length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `${fieldName} must be no more than ${rules.maxLength} characters`;
  }

  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(stringValue)) {
      return `${fieldName} must be a valid email address`;
    }
  }

  // URL validation
  if (rules.url) {
    try {
      new URL(stringValue);
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return `${fieldName} format is invalid`;
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

export function validateForm(
  data: any,
  rules: ValidationRules
): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((fieldName) => {
    const error = validateField(data[fieldName], rules[fieldName], fieldName);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
