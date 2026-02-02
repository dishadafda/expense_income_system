import { getCategories } from "@/app/actions/catalog";
import {
  createSubCategory,
  deleteSubCategory,
} from "@/app/actions/subcategories";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SubCategoriesPage() {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const userId = Number((session?.user as any)?.userId || 0);

  const isAdmin = role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="alert alert-warning">
        Only administrators can manage sub-categories.
      </div>
    );
  }

  const [categories, subCategories] = await Promise.all([
    getCategories(),
    prisma.sub_categories.findMany({
      include: {
        categories: true,
      },
      orderBy: [{ SubCategoryName: "asc" }],
    }),
  ]);

  async function handleCreate(formData: FormData) {
    "use server";
    if (!isAdmin || !userId) return;
    await createSubCategory(formData, userId);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    if (!isAdmin) return;
    const id = Number(formData.get("id"));
    if (!id) return;
    await deleteSubCategory(id);
  }

  return (
    <div>
      <h1 className="h3 mb-4 text-black">Sub-Categories Management</h1>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">Add Sub-Category</h2>
          <form action={handleCreate} className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label" htmlFor="categoryId">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="form-select"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>
                    {c.CategoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="name">
                Sub-Category Name <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                name="name"
                className="form-control"
                required
              />
            </div>
            <div className="col-md-2">
              <div className="form-check">
                <input
                  id="isExpense"
                  name="isExpense"
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="isExpense">
                  Expense
                </label>
              </div>
              <div className="form-check">
                <input
                  id="isIncome"
                  name="isIncome"
                  type="checkbox"
                  className="form-check-input"
                />
                <label className="form-check-label" htmlFor="isIncome">
                  Income
                </label>
              </div>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Category</th>
                <th scope="col">Sub-Category Name</th>
                <th scope="col">Type</th>
                <th scope="col">Active</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subCategories.map((s) => (
                <tr key={s.SubCategoryID}>
                  <td>{s.SubCategoryID}</td>
                  <td>{s.categories?.CategoryName || "-"}</td>
                  <td>{s.SubCategoryName}</td>
                  <td>
                    {s.IsExpense && "Expense"}
                    {s.IsExpense && s.IsIncome && " / "}
                    {s.IsIncome && "Income"}
                  </td>
                  <td>{s.IsActive ? "Yes" : "No"}</td>
                  <td>
                    <form action={handleDelete}>
                      <input
                        type="hidden"
                        name="id"
                        value={s.SubCategoryID}
                      />
                      <button
                        type="submit"
                        className="btn btn-sm btn-outline-danger"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {subCategories.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No sub-categories found.
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
