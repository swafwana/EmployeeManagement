import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, DollarSign, TrendingUp, Users } from 'lucide-react';
import { getDashboardSummary } from '../api/dashboardApi';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadSummary() {
      try {
        const data = await getDashboardSummary();
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load dashboard metrics.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadSummary();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white p-5 shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Employees',
      value: summary.totalEmployees,
      icon: Users,
      accent: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Total Departments',
      value: summary.totalDepartments,
      icon: Building2,
      accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Payroll',
      value: formatCurrency(summary.totalPayroll),
      icon: DollarSign,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Average Salary',
      value: formatCurrency(summary.averageSalary),
      icon: TrendingUp,
      accent: 'bg-sky-50 text-sky-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">
            Overview of employee headcount, departments, and compensation.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage Departments
          </Link>
          <Link
            to="/employees"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View Employees
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Employees by Department</h3>
            <p className="text-sm text-slate-500">
              Click a department to filter the employee directory.
            </p>
          </div>
          <Link
            to="/departments"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Manage all
          </Link>
        </div>

        {summary.departments.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm text-slate-600">No departments created yet.</p>
            <Link
              to="/departments"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create First Department
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.departments.map((dept) => {
              const share =
                summary.totalEmployees > 0
                  ? Math.round((dept.employeeCount / summary.totalEmployees) * 100)
                  : 0;

              return (
                <Link
                  key={dept.departmentId}
                  to={`/employees?departmentId=${dept.departmentId}`}
                  className="group rounded-lg border border-slate-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 group-hover:text-indigo-700">
                      {dept.departmentName}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                      {dept.employeeCount} {dept.employeeCount === 1 ? 'employee' : 'employees'}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
