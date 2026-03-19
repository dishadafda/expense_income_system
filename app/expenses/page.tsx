import {
  getCategories,
  getProjects,
  getSubCategories,
  getPeople,
} from "@/app/actions/catalog";
import { createExpense, updateExpense, deleteExpense } from "@/app/actions/expenses";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ExportButtons from "@/app/components/ExportButtons";

export default async function ExpensesPage({
  searchParams,
}: {
  // Updated type to support both Next.js 14 and 15 (Promise-based searchParams)
  searchParams: Promise<{ categoryId?: string; projectId?: string; peopleId?: string; edit?: string }> | { categoryId?: string; projectId?: string; peopleId?: string; edit?: string };
}) {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const peopleId = Number((session?.user as any)?.peopleId || 0);
  const parentUserId = Number((session?.user as any)?.parentUserId || 0);
  const isAdmin = role === "ADMIN";

  if (!role || (!isAdmin && (!peopleId || !parentUserId))) {
    return <div className="alert alert-danger">Not authorized.</div>;
  }

  // Await searchParams to prevent Next.js 15 bugs where params evaluate to undefined
  const resolvedParams = await searchParams;
  const filterCategoryId = resolvedParams?.categoryId;
  const filterProjectId = resolvedParams?.projectId;
  const filterPeopleId = resolvedParams?.peopleId;

  // Build the dynamic where clause perfectly tailored for the current role
  const expenseWhere: any = {};
  
  if (isAdmin) {
    // Admin only sees expenses tied to their system
    expenseWhere.UserID = parentUserId;
    // Admin can filter by specific employee
    if (filterPeopleId) {
      expenseWhere.PeopleID = Number(filterPeopleId);
    }
  } else {
    // Normal users strictly only see their own expenses
    expenseWhere.PeopleID = peopleId;
  }

  // Apply Category and Project filters
  if (filterCategoryId) {
    expenseWhere.CategoryID = Number(filterCategoryId);
  }
  if (filterProjectId) {
    expenseWhere.ProjectID = Number(filterProjectId);
  }

  const [categories, subCategories, projects, people, expenses] =
    await Promise.all([
      getCategories(role, parentUserId),
      getSubCategories(role, parentUserId),
      getProjects(role, parentUserId),
      getPeople(role, parentUserId),
      prisma.expenses.findMany({
        where: expenseWhere,
        include: {
          categories: true,
          sub_categories: true,
          projects: true,
          peoples: true,
        },
        orderBy: { ExpenseDate: "desc" },
        take: 50,
      }),
    ]);

  const expenseCategories = categories.filter((c) => c.IsExpense);
  const expenseSubCategories = subCategories.filter((s) => s.IsExpense);

  const editId = resolvedParams?.edit ? Number(resolvedParams.edit) : null;
  const editingExpense = editId ? expenses.find((e) => e.ExpenseID === editId) : null;

  const formatDateForInput = (dateObject?: Date | null) => {
    if (!dateObject) return "";
    return new Date(dateObject).toISOString().split('T')[0];
  };

  const exportData = expenses.map(e => ({
    "Date": e.ExpenseDate.toISOString().slice(0, 10),
    "Category": e.categories?.CategoryName || "-",
    "Sub Category": e.sub_categories?.SubCategoryName || "-",
    ...(isAdmin ? { "People": e.peoples?.PeopleName || "-" } : {}),
    "Project": e.projects?.ProjectName || "-",
    "Amount": Number(e.Amount).toFixed(2),
    "Detail": e.ExpenseDetail || "-",
    "Description": e.Description || "-",
  }));

  return (
    <div>
      <h1 className="h3 text-black mb-4">Expenses</h1>

      {isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">Filter Expenses</h2>
            <form method="get" className="row g-3">
              <div className="col-md-3">
                <label className="form-label" htmlFor="filterCategoryId">
                  Filter by Category
                </label>
                <select
                  id="filterCategoryId"
                  name="categoryId"
                  className="form-select"
                  defaultValue={filterCategoryId || ""}
                >
                  <option value="">All Categories</option>
                  {expenseCategories.map((c) => (
                    <option key={c.CategoryID} value={c.CategoryID}>
                      {c.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="filterProjectId">
                  Filter by Project
                </label>
                <select
                  id="filterProjectId"
                  name="projectId"
                  className="form-select"
                  defaultValue={filterProjectId || ""}
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.ProjectID} value={p.ProjectID}>
                      {p.ProjectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1">
                  Apply Filters
                </button>
                <a href="/expenses" className="btn btn-outline-secondary flex-grow-1">
                  Clear
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
            <form action={editingExpense ? updateExpense.bind(null, editingExpense.ExpenseID) : createExpense} className="row g-3">
            <div className="col-md-3">
              <label className="form-label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="form-control"
                required
                defaultValue={formatDateForInput(editingExpense?.ExpenseDate)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                required
                defaultValue={editingExpense ? Number(editingExpense.Amount).toString() : ""}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="categoryId">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="form-select"
                defaultValue={editingExpense?.CategoryID || ""}
              >
                <option value="">Select</option>
                {expenseCategories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>
                    {c.CategoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="subCategoryId">
                Sub Category
              </label>
              <select
                id="subCategoryId"
                name="subCategoryId"
                className="form-select"
                defaultValue={editingExpense?.SubCategoryID || ""}
              >
                <option value="">Select</option>
                {expenseSubCategories.map((s) => (
                  <option key={s.SubCategoryID} value={s.SubCategoryID}>
                    {s.SubCategoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="projectId">
                Project
              </label>
              <select
                id="projectId"
                name="projectId"
                className="form-select"
                defaultValue={editingExpense?.ProjectID || ""}
              >
                <option value="">Select</option>
                {projects.map((p) => (
                  <option key={p.ProjectID} value={p.ProjectID}>
                    {p.ProjectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="detail">
                Detail
              </label>
              <input id="detail" name="detail" className="form-control" defaultValue={editingExpense?.ExpenseDetail || ""} />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <input
                id="description"
                name="description"
                className="form-control"
                defaultValue={editingExpense?.Description || ""}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label" htmlFor="attachment">
                Receipt / Bill (Optional) {editingExpense?.AttachmentPath && <a href={editingExpense.AttachmentPath} target="_blank" className="ms-2 text-primary fs-6">View Current</a>}
              </label>
              <input
                id="attachment"
                name="attachment"
                type="file"
                className="form-control"
                accept="image/*,.pdf"
              />
            </div>
            <div className="col-12 d-flex justify-content-end gap-2">
              {editingExpense && (
                <Link href="/expenses" className="btn btn-secondary">Cancel</Link>
              )}
              <button type="submit" className="btn btn-primary">
                {editingExpense ? "Update Expense" : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h6 mb-0">Recent Expenses</h2>
            <ExportButtons data={exportData} filename="Expenses_Report" />
          </div>
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Category</th>
                <th scope="col">Sub Category</th>
                {isAdmin && <th scope="col">People</th>}
                <th scope="col">Project</th>
                <th scope="col" className="text-center">Receipt</th>
                <th scope="col" className="text-end">
                  Amount
                </th>
                {!isAdmin && <th scope="col" className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.ExpenseID}>
                  <td>{e.ExpenseDate.toISOString().slice(0, 10)}</td>
                  <td>{e.categories?.CategoryName || "-"}</td>
                  <td>{e.sub_categories?.SubCategoryName || "-"}</td>
                  {isAdmin && <td>{e.peoples?.PeopleName || "-"}</td>}
                  <td>{e.projects?.ProjectName || "-"}</td>
                  <td className="text-center">
                    {e.AttachmentPath ? (
                      <a href={e.AttachmentPath} target="_blank" className="text-decoration-none">
                        📎 View
                      </a>
                    ) : "-"}
                  </td>
                  <td className="text-end">
                    ₹ {Number(e.Amount).toFixed(2)}
                  </td>
                  {!isAdmin && (
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Link href={`/expenses?edit=${e.ExpenseID}`} className="btn btn-sm btn-outline-primary">Edit</Link>
                        <form action={async () => { "use server"; await deleteExpense(e.ExpenseID); }}>
                          <button type="submit" className="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 8} className="text-center text-muted">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}