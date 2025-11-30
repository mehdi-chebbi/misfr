// Microsoft OAuth Type Definitions
declare global {
  interface Window {
    microsoft?: {
      Teams?: {
        initialize: () => void;
      };
    };
  }
}

// Microsoft OAuth Response Types
export interface MicrosoftTokenResponse {
  token_type: string;
  scope: string;
  expires_in: number;
  access_token: string;
  refresh_token?: string;
  id_token: string;
}

export interface MicrosoftUserInfo {
  id: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  userPrincipalName: string;
  mail?: string;
  jobTitle?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  mobilePhone?: string;
}

export interface MicrosoftIdTokenPayload {
  aud: string;           // Audience (app client ID)
  iss: string;           // Issuer
  iat: number;           // Issued At
  exp: number;           // Expiration
  name?: string;         // Full name
  email?: string;        // Email address
  given_name?: string;    // First name
  family_name?: string;   // Last name
  oid: string;           // Object ID (user ID)
  preferred_username?: string; // Username
  sub: string;           // Subject (user identifier)
  tid: string;           // Tenant ID
  upn?: string;          // User Principal Name
  ver: string;           // Token version
}

// Microsoft OAuth Configuration
export interface MicrosoftOAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scope: string[];
  responseType: 'code';
  responseMode: 'query' | 'fragment';
}

// Microsoft OAuth Error Types
export interface MicrosoftOAuthError {
  error: string;
  error_description?: string;
  error_codes?: number[];
  timestamp?: string;
  trace_id?: string;
  correlation_id?: string;
}

// API Response Types
export interface MicrosoftAuthResponse {
  success: boolean;
  url?: string;
  user?: {
    id: string;
    name: string;
    last_name: string;
    email: string;
    institution?: string;
    phone_number?: string;
    role: string;
  };
  message?: string;
  error?: string;
}

export {};