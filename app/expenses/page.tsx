import {
  getCategories,
  getProjects,
  getSubCategories,
  getPeople,
} from "@/app/actions/catalog";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { categoryId?: string; projectId?: string };
}) {
  const session = await getServerAuthSession();
  const userId = Number((session?.user as any)?.userId || 0);
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const isAdmin = role === "ADMIN";

  if (!userId) {
    return <div className="alert alert-danger">Not authorized.</div>;
  }

  // Build where clause based on role and filters
  const whereClause: any = {};
  if (!isAdmin) {
    // Normal users only see their own expenses
    whereClause.UserID = userId;
  }
  if (searchParams.categoryId) {
    whereClause.CategoryID = Number(searchParams.categoryId);
  }
  if (searchParams.projectId) {
    whereClause.ProjectID = Number(searchParams.projectId);
  }

  const [categories, subCategories, projects, people, expenses] =
    await Promise.all([
      getCategories(),
      getSubCategories(),
      getProjects(),
      getPeople(),
      prisma.expenses.findMany({
        where: whereClause,
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

  async function addExpense(formData: FormData) {
    "use server";

    const sessionInner = await getServerAuthSession();
    const userIdInner = Number((sessionInner?.user as any)?.userId || 0);
    if (!userIdInner) return;

    const dateStr = String(formData.get("date") || "");
    const amountStr = String(formData.get("amount") || "");
    const categoryIdStr = String(formData.get("categoryId") || "");
    const subCategoryIdStr = String(formData.get("subCategoryId") || "");
    const peopleIdStr = String(formData.get("peopleId") || "");
    const projectIdStr = String(formData.get("projectId") || "");
    const detail = String(formData.get("detail") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!dateStr || !amountStr || !peopleIdStr) {
      return;
    }

    const amount = parseFloat(amountStr);
    const date = new Date(dateStr);

    await prisma.expenses.create({
      data: {
        ExpenseDate: date,
        Amount: amount,
        CategoryID: categoryIdStr ? Number(categoryIdStr) : null,
        SubCategoryID: subCategoryIdStr ? Number(subCategoryIdStr) : null,
        PeopleID: Number(peopleIdStr),
        ProjectID: projectIdStr ? Number(projectIdStr) : null,
        ExpenseDetail: detail || null,
        Description: description || null,
        UserID: userIdInner,
      },
    });

    revalidatePath("/expenses");
  }

  return (
    <div>
      <h1 className="h3 text-black mb-4">Expenses</h1>

      {isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">Filter Expenses</h2>
            <form method="get" className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="filterCategoryId">
                  Filter by Category
                </label>
                <select
                  id="filterCategoryId"
                  name="categoryId"
                  className="form-select"
                  defaultValue={searchParams.categoryId || ""}
                >
                  <option value="">All Categories</option>
                  {expenseCategories.map((c) => (
                    <option key={c.CategoryID} value={c.CategoryID}>
                      {c.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="filterProjectId">
                  Filter by Project
                </label>
                <select
                  id="filterProjectId"
                  name="projectId"
                  className="form-select"
                  defaultValue={searchParams.projectId || ""}
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.ProjectID} value={p.ProjectID}>
                      {p.ProjectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary me-2">
                  Apply Filters
                </button>
                <a href="/expenses" className="btn btn-outline-secondary">
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
            <h2 className="h6 mb-3">Add Expense</h2>
            <form action={addExpense} className="row g-3">
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
              <input id="detail" name="detail" className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <input
                id="description"
                name="description"
                className="form-control"
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary">
                Save Expense
              </button>
            </div>
          </form>
        </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Recent Expenses</h2>
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Category</th>
                <th scope="col">Sub Category</th>
                {isAdmin && <th scope="col">People</th>}
                <th scope="col">Project</th>
                <th scope="col" className="text-end">
                  Amount
                </th>
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
                  <td className="text-end">
                    ₹ {Number(e.Amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted">
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

