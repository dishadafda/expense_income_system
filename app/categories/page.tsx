import { getCategories } from "@/app/actions/catalog";
import { createCategory, deleteCategory } from "@/app/actions/categories";
import { getServerAuthSession } from "@/lib/auth";

export default async function CategoriesPage() {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const userId = Number((session?.user as any)?.userId || 0);
  const isUser = role === "USER";

  const categories = await getCategories(role, userId);

  async function handleCreate(formData: FormData) {
    "use server";
    if (!isUser) return;
    await createCategory(formData);
  }

  return (
    <div>
      <h1 className="h3 mb-4 text-black">Categories {role === "ADMIN" && "(View Only)"}</h1>

      {isUser && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">Add Category</h2>
            <form action={handleCreate} className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label" htmlFor="name">Name</label>
                <input id="name" name="name" className="form-control" required />
              </div>
              <div className="col-md-3">
                <div className="form-check">
                  <input id="isExpense" name="isExpense" type="checkbox" className="form-check-input" defaultChecked />
                  <label className="form-check-label">Expense</label>
                </div>
                <div className="form-check">
                  <input id="isIncome" name="isIncome" type="checkbox" className="form-check-input" />
                  <label className="form-check-label">Income</label>
                </div>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">Save</button>
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
                <th>ID</th><th>Name</th><th>Type</th><th>Active</th>{isUser && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.CategoryID}>
                  <td>{c.CategoryID}</td>
                  <td>{c.CategoryName}</td>
                  <td>{c.IsExpense && "Expense"} {c.IsExpense && c.IsIncome && "/"} {c.IsIncome && "Income"}</td>
                  <td>{c.IsActive ? "Yes" : "No"}</td>
                  {isUser && (
                    <td>
                      <form action={async () => { "use server"; await deleteCategory(c.CategoryID); }}>
                        <button type="submit" className="btn btn-sm btn-outline-danger">Delete</button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}