// Security utilities for the frontend

interface RateLimit {
  count: number;
  resetTime: number;
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

class SecurityManager {
  private static instance: SecurityManager;
  private rateLimits: Map<string, RateLimit> = new Map();
  private csrfToken: string | null = null;

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  constructor() {
    this.initializeCSRF();
    this.setupSecurityHeaders();
  }

  // CSRF Protection
  private initializeCSRF() {
    this.csrfToken = this.generateCSRFToken();
    localStorage.setItem('csrf_token', this.csrfToken);
  }

  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  getCSRFToken(): string | null {
    return this.csrfToken;
  }

  // Rate Limiting
  checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Input Validation
  validateInput(data: any, schema: ValidationSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      // Required field check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(rules.errorMessage || `${field} is required`);
        continue;
      }

      // Skip validation for optional empty fields
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(rules.errorMessage || `${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(rules.errorMessage || `${field} must be no more than ${rules.maxLength} characters`);
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.errorMessage || `${field} format is invalid`);
      }

      // Custom validation
      if (rules.customValidator && !rules.customValidator(value)) {
        errors.push(rules.errorMessage || `${field} is invalid`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // XSS Protection
  sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Content Security Policy helpers
  private setupSecurityHeaders() {
    // Set security headers for the application
    if (typeof document !== 'undefined') {
      // Add meta tags for security
      this.addMetaTag('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.gstatic.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: http:; " +
        "media-src 'self' https: http:; " +
        "connect-src 'self' https: ws: wss:; " +
        "frame-src 'self' https://www.youtube.com;"
      );

      this.addMetaTag('X-Content-Type-Options', 'nosniff');
      this.addMetaTag('X-Frame-Options', 'SAMEORIGIN');
      this.addMetaTag('X-XSS-Protection', '1; mode=block');
      this.addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
  }

  private addMetaTag(name: string, content: string) {
    const existing = document.querySelector(`meta[http-equiv="${name}"]`);
    if (!existing) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', name);
      meta.content = content;
      document.head.appendChild(meta);
    }
  }

  // Secure API requests
  async secureApiRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Rate limiting
    const rateLimitKey = `api_${url}`;
    if (!this.checkRateLimit(rateLimitKey, 60, 60000)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Add security headers
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(this.csrfToken && { 'X-CSRF-Token': this.csrfToken }),
        ...(options.headers || {})
      }
    };

    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      secureOptions.headers = {
        ...secureOptions.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    try {
      const response = await fetch(url, secureOptions);
      
      // Check for security-related response headers
      this.checkSecurityHeaders(response);
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private checkSecurityHeaders(response: Response) {
    // Log warnings for missing security headers
    const securityHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection'
    ];

    securityHeaders.forEach(header => {
      if (!response.headers.get(header)) {
        console.warn(`Missing security header: ${header}`);
      }
    });
  }
}

// Validation schemas for common forms
export const ValidationSchemas = {
  login: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      errorMessage: 'Password must be at least 8 characters'
    }
  },

  register: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      errorMessage: 'Name must contain only letters and spaces'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    confirmPassword: {
      required: true,
      customValidator: (value: string, data: any) => value === data.password,
      errorMessage: 'Passwords do not match'
    }
  },

  profile: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      errorMessage: 'Name must contain only letters and spaces'
    },
    phone: {
      pattern: /^\+?[\d\s-()]+$/,
      errorMessage: 'Please enter a valid phone number'
    },
    institution: {
      maxLength: 100,
      errorMessage: 'Institution name too long'
    }
  },

  quiz: {
    answers: {
      required: true,
      customValidator: (answers: any[]) => Array.isArray(answers) && answers.length > 0,
      errorMessage: 'Please answer all questions'
    }
  },

  forum: {
    title: {
      required: true,
      minLength: 5,
      maxLength: 200,
      errorMessage: 'Title must be between 5 and 200 characters'
    },
    content: {
      required: true,
      minLength: 10,
      maxLength: 5000,
      errorMessage: 'Content must be between 10 and 5000 characters'
    }
  }
};

// Security hooks for React components
export const useSecurity = () => {
  const security = SecurityManager.getInstance();

  const validateForm = (data: any, schema: ValidationSchema) => {
    return security.validateInput(data, schema);
  };

  const sanitizeInput = (input: string) => {
    return security.sanitizeInput(input);
  };

  const secureApiCall = async (url: string, options?: RequestInit) => {
    return security.secureApiRequest(url, options);
  };

  const checkRateLimit = (key: string, maxRequests?: number, windowMs?: number) => {
    return security.checkRateLimit(key, maxRequests, windowMs);
  };

  const getCSRFToken = () => {
    return security.getCSRFToken();
  };

  return {
    validateForm,
    sanitizeInput,
    secureApiCall,
    checkRateLimit,
    getCSRFToken
  };
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Include lowercase letters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Include uppercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 15;
  } else {
    feedback.push('Include numbers');
  }

  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Include special characters (@$!%*?&)');
  }

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 50) {
    strength = 'weak';
  } else if (score < 75) {
    strength = 'fair';
  } else if (score < 90) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return { score, feedback, strength };
};

// Secure storage utilities
export const SecureStorage = {
  setItem: (key: string, value: string, encrypt: boolean = false) => {
    try {
      let storedValue = value;
      if (encrypt) {
        // Simple encryption (in production, use proper encryption)
        storedValue = btoa(value);
      }
      localStorage.setItem(key, storedValue);
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  },

  getItem: (key: string, decrypt: boolean = false): string | null => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      
      if (decrypt) {
        // Simple decryption (in production, use proper decryption)
        return atob(value);
      }
      return value;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};

// Session management
export const SessionManager = {
  startSession: (userId: string, expirationMinutes: number = 60) => {
    const expirationTime = Date.now() + (expirationMinutes * 60 * 1000);
    SecureStorage.setItem('session_user', userId);
    SecureStorage.setItem('session_expires', expirationTime.toString());
  },

  isSessionValid: (): boolean => {
    const userId = SecureStorage.getItem('session_user');
    const expiresAt = SecureStorage.getItem('session_expires');
    
    if (!userId || !expiresAt) {
      return false;
    }

    return Date.now() < parseInt(expiresAt);
  },

  extendSession: (additionalMinutes: number = 30) => {
    if (SessionManager.isSessionValid()) {
      const currentExpiry = parseInt(SecureStorage.getItem('session_expires') || '0');
      const newExpiry = currentExpiry + (additionalMinutes * 60 * 1000);
      SecureStorage.setItem('session_expires', newExpiry.toString());
    }
  },

  endSession: () => {
    SecureStorage.removeItem('session_user');
    SecureStorage.removeItem('session_expires');
    SecureStorage.removeItem('token');
  }
};

export default SecurityManager;
