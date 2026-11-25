import { apiRequest } from './client';

export function getDepartments() {
  return apiRequest('/departments');
}

export function getDepartmentById(id) {
  return apiRequest(`/departments/${id}`);
}

export function createDepartment(data) {
  return apiRequest('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDepartment(id, data) {
  return apiRequest(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDepartment(id) {
  return apiRequest(`/departments/${id}`, {
    method: 'DELETE',
  });
}
