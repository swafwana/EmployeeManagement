const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:5003/api';

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseErrorResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    return new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  const fieldErrors = {};
  if (payload?.errors && typeof payload.errors === 'object') {
    for (const [key, messages] of Object.entries(payload.errors)) {
      const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
      fieldErrors[normalizedKey] = Array.isArray(messages) ? messages[0] : String(messages);
    }
  }

  const firstFieldError = Object.values(fieldErrors)[0];
  const message =
    payload?.detail ||
    firstFieldError ||
    payload?.title ||
    `Request failed with status ${response.status}`;

  return new ApiError(message, response.status, fieldErrors);
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
