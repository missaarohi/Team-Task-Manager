const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('task-manager-token');

export const apiRequest = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.errors?.map((error) => error.message).join(', ');
    throw new Error(detail || data.message || 'Request failed');
  }

  return data;
};
