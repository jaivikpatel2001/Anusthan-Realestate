import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Helper function to sanitize request body and remove circular references
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;

  try {
    // Try to stringify to detect circular references
    JSON.stringify(body);
    return body;
  } catch (error) {
    if (error.message.includes('circular')) {
      console.warn('Circular reference detected in request body, sanitizing...');

      // Create a sanitized version by removing problematic properties
      const sanitized = {};
      for (const [key, value] of Object.entries(body)) {
        try {
          JSON.stringify(value);
          sanitized[key] = value;
        } catch (e) {
          console.warn(`Removing property '${key}' due to circular reference`);
          // Skip this property
        }
      }
      return sanitized;
    }
    throw error;
  }
};

// Base query with re-authentication
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Sanitize the request body if it exists
  if (args && typeof args === 'object' && args.body) {
    args = {
      ...args,
      body: sanitizeRequestBody(args.body)
    };
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken: api.getState().auth.refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Store the new tokens
      api.dispatch(setCredentials(refreshResult.data));
      // Retry the original query
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project', 'Apartment', 'Lead', 'User', 'Settings'],
  endpoints: (builder) => ({}),
});

// Import setCredentials and logout actions (will be defined in authSlice)
import { setCredentials, logout } from '../slices/authSlice';
