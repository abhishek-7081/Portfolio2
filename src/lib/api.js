const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: isFormData
      ? options.headers
      : {
          'Content-Type': 'application/json',
          ...(options.headers ?? {})
        },
    body:
      options.body == null
        ? undefined
        : isFormData
          ? options.body
          : JSON.stringify(options.body)
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }

  return payload;
};

export const portfolioApi = {
  getPortfolio() {
    return request('/portfolio');
  },
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },
  logout() {
    return request('/auth/logout', {
      method: 'POST'
    });
  },
  session() {
    return request('/auth/me');
  },
  updateSection(sectionKey, value) {
    return request(`/admin/sections/${sectionKey}`, {
      method: 'PUT',
      body: { value }
    });
  },
  uploadImage(formData) {
    return request('/admin/uploads', {
      method: 'POST',
      body: formData
    });
  }
};
