import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from '../api/departmentsApi';
import ConfirmDialog from '../components/ConfirmDialog';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!newName.trim() || newName.trim().length < 2) {
      setError('Department name must be at least 2 characters.');
      return;
    }

    setCreating(true);
    try {
      await createDepartment({ departmentName: newName.trim() });
      setNewName('');
      await loadDepartments();
    } catch (err) {
      setError(err.message || 'Failed to create department.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(dept) {
    setError('');
    setEditingId(dept.departmentId);
    setEditingName(dept.departmentName);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
  }

  async function handleSaveEdit(id) {
    setError('');
    if (!editingName.trim() || editingName.trim().length < 2) {
      setError('Department name must be at least 2 characters.');
      return;
    }

    setSavingEdit(true);
    try {
      await updateDepartment(id, { departmentName: editingName.trim() });
      setEditingId(null);
      setEditingName('');
      await loadDepartments();
    } catch (err) {
      setError(err.message || 'Failed to update department.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setError('');
    setDeleting(true);
    try {
      await deleteDepartment(deleteTarget.departmentId);
      setDeleteTarget(null);
      await loadDepartments();
    } catch (err) {
      setError(err.message || 'Failed to delete department.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Departments</h2>
        <p className="text-sm text-slate-500">
          Create, rename, or remove departments. Departments with active employees cannot be deleted.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New department name (e.g., Engineering)"
          aria-label="New department name"
          className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {creating ? 'Adding...' : 'Add Department'}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">No departments yet.</p>
            <p className="text-sm text-slate-500">Add a department above to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {departments.map((dept) => {
              const isEditing = editingId === dept.departmentId;
              return (
                <li
                  key={dept.departmentId}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => handleSaveEdit(dept.departmentId)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-slate-900">{dept.departmentName}</p>
                      <Link
                        to={`/employees?departmentId=${dept.departmentId}`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        {dept.employeeCount}{' '}
                        {dept.employeeCount === 1 ? 'employee' : 'employees'}
                      </Link>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(dept)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(dept)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Department"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.departmentName}"?`
            : ''
        }
        confirmLabel="Delete Department"
        isSubmitting={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
