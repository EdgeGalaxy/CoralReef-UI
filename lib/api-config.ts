export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const getApiUrl = (path: string): string => {
  if (path) {
    return `${API_BASE_URL}${path}`;
  }
  return API_BASE_URL;
};
