import { apiRequest } from './client';

export function getEmployees({ search = '', departmentId = '' } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set('search', search.trim());
  }
  if (departmentId) {
    params.set('departmentId', String(departmentId));
  }
  const queryString = params.toString();
  return apiRequest(`/employees${queryString ? `?${queryString}` : ''}`);
}

export function getEmployeeById(id) {
  return apiRequest(`/employees/${id}`);
}

export function createEmployee(data) {
  return apiRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateEmployee(id, data) {
  return apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(id) {
  return apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  });
}
