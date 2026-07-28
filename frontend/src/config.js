// Centralized API configuration supporting VITE_API_BASE_URL with fallback for local dev
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
