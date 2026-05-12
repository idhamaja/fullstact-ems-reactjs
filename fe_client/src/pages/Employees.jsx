import { useCallback, useEffect, useState } from "react";
import { dummyEmployeeData, DEPARTMENTS } from "../assets/assets";
import { Plus, Search, X } from "lucide-react";
import EmployeeCards from "../components/EmployeeCards";
import EmployeeForm from "../components/EmployeeForm";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [editEmployee, setEditEmployee] = useState("");
  const [showCreatedModal, setShowCreatedModal] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setEmployees(
      dummyEmployeeData.filter((emp) =>
        selectedDept ? emp.department === selectedDept : emp,
      ),
    );
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filtered = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName} ${emp.position}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="animate-fade-in">
      {/*HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your team members</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowCreatedModal(true)}
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>
      {/*SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type=""
            placeholder="Search employees..."
            className="w-full pl-10!"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
        <select
          className="max-w-40"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option>All Departments</option>
          {DEPARTMENTS.map((deptName) => (
            <option key={deptName} value={deptName}>
              {deptName}
            </option>
          ))}
        </select>
      </div>

      {/*EMPLOYEES CARDS */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No Employee Found
            </p>
          ) : (
            filtered.map((emp) => (
              <EmployeeCards
                key={emp.id}
                employee={emp}
                onDelete={fetchEmployees}
                onEdit={(e) => setEditEmployee(e)}
              />
            ))
          )}

          {/*Create Employe Modal */}
          {showCreatedModal && (
            <div
              className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreatedModal(false)}
            >
              <div className="fixed inset-0" />
              <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 pb-0">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Add New Employee
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Create a user account and employee profile
                    </p>
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    onClick={() => setShowCreatedModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  {" "}
                  <div className="p-6">
                    <EmployeeForm
                      onSuccess={() => {
                        setShowCreatedModal(false);
                        fetchEmployees();
                      }}
                      onCancel={() => setShowCreatedModal(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/*Edit Employee Modal */}
          {editEmployee && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm"
              onClick={() => setEditEmployee(null)}
            >
              <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 pb-0">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Edit Employee
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Update Employee Details
                    </p>
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    onClick={() => setEditEmployee(null)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* */}
                <div className="p-6">
                  <EmployeeForm
                    initialData={editEmployee}
                    onSuccess={() => {
                      setEditEmployee(null);
                      fetchEmployees();
                    }}
                    onCancel={() => setEditEmployee(null)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Employees;
