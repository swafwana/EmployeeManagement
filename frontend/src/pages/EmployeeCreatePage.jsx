import { useNavigate } from 'react-router-dom';
import { createEmployee } from '../api/employeesApi';
import EmployeeForm from '../components/EmployeeForm';

export default function EmployeeCreatePage() {
  const navigate = useNavigate();

  async function handleCreate(payload) {
    await createEmployee(payload);
    navigate('/employees');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add Employee</h2>
        <p className="text-sm text-slate-500">Create a new employee record and assign a department.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <EmployeeForm submitLabel="Create Employee" onSubmit={handleCreate} />
      </div>
    </div>
  );
}
