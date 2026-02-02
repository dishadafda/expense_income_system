import {
  getCategories,
  getProjects,
  getSubCategories,
  getPeople,
} from "@/app/actions/catalog";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function IncomesPage({
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
    // Normal users only see their own incomes
    whereClause.UserID = userId;
  }
  if (searchParams.categoryId) {
    whereClause.CategoryID = Number(searchParams.categoryId);
  }
  if (searchParams.projectId) {
    whereClause.ProjectID = Number(searchParams.projectId);
  }

  const [categories, subCategories, projects, people, incomes] =
    await Promise.all([
      getCategories(),
      getSubCategories(),
      getProjects(),
      getPeople(),
      prisma.incomes.findMany({
        where: whereClause,
        include: {
          categories: true,
          sub_categories: true,
          projects: true,
          peoples: true,
        },
        orderBy: { IncomeDate: "desc" },
        take: 50,
      }),
    ]);

  const incomeCategories = categories.filter((c) => c.IsIncome);
  const incomeSubCategories = subCategories.filter((s) => s.IsIncome);

  async function addIncome(formData: FormData) {
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
    const selectedPeopleId = Number(peopleIdStr);

    // For admin: use the selected people's UserID, for normal users: use their own UserID
    const sessionForUser = await getServerAuthSession();
    const roleForUser = (sessionForUser?.user as any)?.role as
      | "ADMIN"
      | "USER"
      | undefined;
    const isAdminForUser = roleForUser === "ADMIN";

    let targetUserId = userIdInner;
    if (isAdminForUser && selectedPeopleId) {
      // Admin can add income for any people - get the UserID from peoples table
      const selectedPeople = await prisma.peoples.findUnique({
        where: { PeopleID: selectedPeopleId },
      });
      if (selectedPeople) {
        targetUserId = selectedPeople.UserID;
      }
    }

    await prisma.incomes.create({
      data: {
        IncomeDate: date,
        Amount: amount,
        CategoryID: categoryIdStr ? Number(categoryIdStr) : null,
        SubCategoryID: subCategoryIdStr ? Number(subCategoryIdStr) : null,
        PeopleID: selectedPeopleId,
        ProjectID: projectIdStr ? Number(projectIdStr) : null,
        IncomeDetail: detail || null,
        Description: description || null,
        UserID: targetUserId,
      },
    });

    revalidatePath("/incomes");
  }

  return (
    <div>
      <h1 className="text-black h3 mb-4">Incomes</h1>

      {isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">Filter Incomes</h2>
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
                  {incomeCategories.map((c) => (
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
                <a href="/incomes" className="btn btn-outline-secondary">
                  Clear
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">
            {isAdmin ? "Add Income for People" : "Add Income"}
          </h2>
          <form action={addIncome} className="row g-3">
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
                {incomeCategories.map((c) => (
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
                {incomeSubCategories.map((s) => (
                  <option key={s.SubCategoryID} value={s.SubCategoryID}>
                    {s.SubCategoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="peopleId">
                People <span className="text-danger">*</span>
              </label>
              <select
                id="peopleId"
                name="peopleId"
                className="form-select"
                required
              >
                <option value="">Select</option>
                {people.map((p) => (
                  <option key={p.PeopleID} value={p.PeopleID}>
                    {p.PeopleName}
                  </option>
                ))}
              </select>
              {isAdmin && (
                <small className="text-muted">
                  Select the person for whom you're adding income
                </small>
              )}
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
                Save Income
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Recent Incomes</h2>
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
              {incomes.map((i) => (
                <tr key={i.IncomeID}>
                  <td>{i.IncomeDate.toISOString().slice(0, 10)}</td>
                  <td>{i.categories?.CategoryName || "-"}</td>
                  <td>{i.sub_categories?.SubCategoryName || "-"}</td>
                  {isAdmin && <td>{i.peoples?.PeopleName || "-"}</td>}
                  <td>{i.projects?.ProjectName || "-"}</td>
                  <td className="text-end">
                    ₹ {Number(i.Amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {incomes.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted">
                    No incomes found.
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

