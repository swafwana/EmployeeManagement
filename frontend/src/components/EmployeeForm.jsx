import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDepartments } from '../api/departmentsApi';

const EMPTY_INITIAL_VALUES = {
  name: '',
  email: '',
  salary: '',
  departmentId: '',
};

export default function EmployeeForm({
  initialValues = EMPTY_INITIAL_VALUES,
  submitLabel = 'Save Employee',
  onSubmit,
  cancelTo = '/employees',
}) {
  const initialName = initialValues?.name ?? '';
  const initialEmail = initialValues?.email ?? '';
  const initialSalary =
    initialValues?.salary !== undefined && initialValues?.salary !== null
      ? String(initialValues.salary)
      : '';
  const initialDepartmentId = initialValues?.departmentId
    ? String(initialValues.departmentId)
    : '';

  const [form, setForm] = useState({
    name: initialName,
    email: initialEmail,
    salary: initialSalary,
    departmentId: initialDepartmentId,
  });
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      name: initialName,
      email: initialEmail,
      salary: initialSalary,
      departmentId: initialDepartmentId,
    });
  }, [initialName, initialEmail, initialSalary, initialDepartmentId]);

  useEffect(() => {
    let active = true;
    async function loadDepartments() {
      try {
        const data = await getDepartments();
        if (active) {
          setDepartments(data);
        }
      } catch (err) {
        if (active) {
          setFormError(err.message || 'Failed to load departments.');
        }
      } finally {
        if (active) {
          setLoadingDepartments(false);
        }
      }
    }
    loadDepartments();
    return () => {
      active = false;
    };
  }, []);

  function validateClient() {
    const errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    const numericSalary = Number(form.salary);
    if (!form.salary || Number.isNaN(numericSalary) || numericSalary <= 0) {
      errors.salary = 'Salary must be greater than 0.';
    }
    if (!form.departmentId) {
      errors.departmentId = 'Please select a department.';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        salary: Number(form.salary),
        departmentId: Number(form.departmentId),
      });
    } catch (err) {
      setFormError(err.message || 'Failed to save employee.');
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {!loadingDepartments && departments.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No departments exist yet.{' '}
          <Link to="/departments" className="font-semibold underline">
            Create a department first
          </Link>{' '}
          before adding an employee.
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Priya Sharma"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="e.g., priya.sharma@company.com"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="salary" className="block text-sm font-medium text-slate-700">
            Annual Salary (USD)
          </label>
          <input
            id="salary"
            type="number"
            step="0.01"
            min="0.01"
            value={form.salary}
            onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))}
            placeholder="e.g., 75000"
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
          {fieldErrors.salary && <p className="mt-1 text-xs text-red-600">{fieldErrors.salary}</p>}
        </div>

        <div>
          <label htmlFor="departmentId" className="block text-sm font-medium text-slate-700">
            Department
          </label>
          <select
            id="departmentId"
            disabled={loadingDepartments}
            value={form.departmentId}
            onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:bg-slate-100"
          >
            <option value="">
              {loadingDepartments ? 'Loading departments...' : 'Select a department'}
            </option>
            {departments.map((dept) => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          {fieldErrors.departmentId && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.departmentId}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Link
          to={cancelTo}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting || loadingDepartments || departments.length === 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
