import { getCategories } from "@/app/actions/catalog";
import { createCategory, deleteCategory } from "@/app/actions/categories";
import { getServerAuthSession } from "@/lib/auth";

export default async function CategoriesPage() {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const userId = Number((session?.user as any)?.userId || 0);

  const categories = await getCategories();

  // For now, allow any logged-in user to manage categories.
  // We still keep role in case you later want Admin-only.
  const canManage = !!userId;

  async function handleCreate(formData: FormData) {
    "use server";
    if (!canManage || !userId) return;
    await createCategory(formData, userId);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    if (!canManage) return;
    const id = Number(formData.get("id"));
    if (!id) return;
    await deleteCategory(id);
  }

  return (
    <div>
      <h1 className="h3 mb-4 text-black">Categories</h1>

      {canManage && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">Add Category</h2>
            <form action={handleCreate} className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-3">
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
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Active</th>
                {canManage && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.CategoryID}>
                  <td>{c.CategoryID}</td>
                  <td>{c.CategoryName}</td>
                  <td>
                    {c.IsExpense && "Expense"}
                    {c.IsExpense && c.IsIncome && " / "}
                    {c.IsIncome && "Income"}
                  </td>
                  <td>{c.IsActive ? "Yes" : "No"}</td>
                  {canManage && (
                    <td>
                      <form action={handleDelete}>
                        <input
                          type="hidden"
                          name="id"
                          value={c.CategoryID}
                        />
                        <button
                          type="submit"
                          className="btn btn-sm btn-outline-danger"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="text-center text-muted">
                    No categories found.
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

