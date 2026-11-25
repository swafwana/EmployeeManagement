import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Search, Trash2, UserPlus, X } from 'lucide-react';
import { deleteEmployee, getEmployees } from '../api/employeesApi';
import { getDepartments } from '../api/departmentsApi';
import ConfirmDialog from '../components/ConfirmDialog';

function formatSalary(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDepartment = searchParams.get('departmentId') ?? '';
  const urlSearch = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(urlSearch);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    let active = true;
    getDepartments()
      .then((data) => {
        if (active) setDepartments(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const loadEmployees = useCallback(async (search, departmentId) => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployees({ search, departmentId });
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== urlSearch) {
        const nextParams = new URLSearchParams(searchParams);
        if (trimmed) {
          nextParams.set('search', trimmed);
        } else {
          nextParams.delete('search');
        }
        setSearchParams(nextParams, { replace: true });
      }
      loadEmployees(trimmed, selectedDepartment);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput, selectedDepartment, urlSearch, searchParams, loadEmployees, setSearchParams]);

  function handleDepartmentChange(value) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set('departmentId', value);
    } else {
      nextParams.delete('departmentId');
    }
    setSearchParams(nextParams, { replace: true });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.employeeId);
      setDeleteTarget(null);
      await loadEmployees(searchInput, selectedDepartment);
    } catch (err) {
      setError(err.message || 'Failed to delete employee.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  const hasFilters = Boolean(searchInput.trim() || selectedDepartment);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Employees</h2>
          <p className="text-sm text-slate-500">
            Search, filter by department, and manage employee records.
          </p>
        </div>
        <Link
          to="/employees/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by employee name..."
            aria-label="Search by employee name"
            className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={selectedDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            aria-label="Filter by department"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              {hasFilters ? 'No employees match your current filters.' : 'No employees added yet.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {hasFilters
                ? 'Try clearing your search or selecting a different department.'
                : 'Add your first employee to populate the directory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5 text-right">Salary</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {employees.map((employee) => (
                  <tr key={employee.employeeId} className="hover:bg-slate-50/75">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{employee.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{employee.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {employee.departmentName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                      {formatSalary(employee.salary)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Link
                          to={`/employees/${employee.employeeId}/edit`}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(employee)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Employee"
        message={
          deleteTarget
            ? `Are you sure you want to remove ${deleteTarget.name}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Employee"
        isSubmitting={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
