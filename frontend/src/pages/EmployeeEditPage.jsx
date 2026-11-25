import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getEmployeeById, updateEmployee } from '../api/employeesApi';
import EmployeeForm from '../components/EmployeeForm';

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadEmployee() {
      try {
        const data = await getEmployeeById(id);
        if (active) {
          setEmployee(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Employee not found.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadEmployee();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate(payload) {
    await updateEmployee(id, payload);
    navigate('/employees');
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading employee details...</div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
        <Link
          to="/employees"
          className="inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit Employee</h2>
        <p className="text-sm text-slate-500">Update details for {employee.name}.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <EmployeeForm
          initialValues={{
            name: employee.name,
            email: employee.email,
            salary: employee.salary,
            departmentId: employee.departmentId,
          }}
          submitLabel="Update Employee"
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
}
