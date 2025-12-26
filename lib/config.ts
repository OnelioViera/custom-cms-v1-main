interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
  ALLOWED_ORIGINS?: string;
  
  // Feature Flags
  ENABLE_CACHING: boolean;
  ENABLE_RATE_LIMITING: boolean;
  ENABLE_MONITORING: boolean;
  ENABLE_ERROR_LOGGING: boolean;
  
  // Cache Settings
  CACHE_TTL_PAGES: number;
  CACHE_TTL_PROJECTS: number;
  CACHE_TTL_DEFAULT: number;
  
  // Rate Limiting Settings
  RATE_LIMIT_LOGIN_MAX: number;
  RATE_LIMIT_LOGIN_WINDOW: number;
  RATE_LIMIT_UPLOAD_MAX: number;
  RATE_LIMIT_UPLOAD_WINDOW: number;
  RATE_LIMIT_API_MAX: number;
  RATE_LIMIT_API_WINDOW: number;
  
  // Monitoring Settings
  MONITORING_ENABLED: boolean;
  MONITORING_RETENTION_DAYS: number;
}

class Config {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validate();
  }

  private loadConfig(): EnvironmentConfig {
    return {
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      MONGODB_URI: process.env.MONGODB_URI || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      
      // Feature Flags
      ENABLE_CACHING: process.env.ENABLE_CACHING !== 'false',
      ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',
      ENABLE_MONITORING: process.env.ENABLE_MONITORING !== 'false',
      ENABLE_ERROR_LOGGING: process.env.ENABLE_ERROR_LOGGING !== 'false',
      
      // Cache Settings
      CACHE_TTL_PAGES: parseInt(process.env.CACHE_TTL_PAGES || '60', 10),
      CACHE_TTL_PROJECTS: parseInt(process.env.CACHE_TTL_PROJECTS || '60', 10),
      CACHE_TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT || '60', 10),
      
      // Rate Limiting Settings
      RATE_LIMIT_LOGIN_MAX: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10),
      RATE_LIMIT_LOGIN_WINDOW: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW || '900000', 10), // 15 min
      RATE_LIMIT_UPLOAD_MAX: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '20', 10),
      RATE_LIMIT_UPLOAD_WINDOW: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW || '3600000', 10), // 1 hour
      RATE_LIMIT_API_MAX: parseInt(process.env.RATE_LIMIT_API_MAX || '100', 10),
      RATE_LIMIT_API_WINDOW: parseInt(process.env.RATE_LIMIT_API_WINDOW || '60000', 10), // 1 min
      
      // Monitoring Settings
      MONITORING_ENABLED: process.env.MONITORING_ENABLED !== 'false',
      MONITORING_RETENTION_DAYS: parseInt(process.env.MONITORING_RETENTION_DAYS || '7', 10),
    };
  }

  private validate() {
    const errors: string[] = [];

    // Required fields
    if (!this.config.MONGODB_URI) {
      errors.push('MONGODB_URI is required');
    }
    if (!this.config.JWT_SECRET) {
      errors.push('JWT_SECRET is required');
    }

    // Validate MongoDB URI format
    if (this.config.MONGODB_URI && !this.config.MONGODB_URI.startsWith('mongodb')) {
      errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://');
    }

    // Validate JWT Secret length
    if (this.config.JWT_SECRET && this.config.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }

    // Validate numeric values
    if (this.config.CACHE_TTL_DEFAULT < 0) {
      errors.push('CACHE_TTL_DEFAULT must be a positive number');
    }

    if (errors.length > 0) {
      console.error('Configuration validation failed:');
      errors.forEach(error => console.error(`  - ${error}`));
      
      if (this.config.NODE_ENV === 'production') {
        throw new Error('Invalid configuration. See errors above.');
      }
    }
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  getAll(): EnvironmentConfig {
    return { ...this.config };
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isFeatureEnabled(feature: keyof Pick<EnvironmentConfig, 'ENABLE_CACHING' | 'ENABLE_RATE_LIMITING' | 'ENABLE_MONITORING' | 'ENABLE_ERROR_LOGGING'>): boolean {
    return this.config[feature];
  }
}

export const config = new Config();
