import { getCategories } from "@/app/actions/catalog";
import { createCategory, deleteCategory, updateCategory } from "@/app/actions/categories";
import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";

export default async function CategoriesPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);
  const isUser = role === "USER";

  const categories = await getCategories(role, parentUserId);
  const editId = searchParams?.edit ? Number(searchParams.edit) : null;
  const editingCategory = editId ? categories.find((c) => c.CategoryID === editId) : null;

  async function handleCreate(formData: FormData) {
    "use server";
    if (!isUser) return;
    await createCategory(formData);
  }

  return (
    <div className="app-page w-100">
      <h1 className="h3 mb-4 text-black">Categories {role === "ADMIN" && "(View Only)"}</h1>

      {isUser && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">{editingCategory ? "Edit Category" : "Add Category"}</h2>
            <form action={editingCategory ? updateCategory.bind(null, editingCategory.CategoryID) : handleCreate} className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label" htmlFor="name">Name</label>
                <input id="name" name="name" className="form-control" required defaultValue={editingCategory?.CategoryName || ""} />
              </div>
              <div className="col-md-5">
                <label className="form-label" htmlFor="logoPath">Logo Path</label>
                <input id="logoPath" name="logoPath" className="form-control" maxLength={250} defaultValue={editingCategory?.LogoPath || ""} />
              </div>
              <div className="col-md-2">
                <div className="form-check">
                  <input id="isExpense" name="isExpense" type="checkbox" className="form-check-input" defaultChecked={editingCategory ? editingCategory.IsExpense : true} />
                  <label className="form-check-label">Expense</label>
                </div>
                <div className="form-check">
                  <input id="isIncome" name="isIncome" type="checkbox" className="form-check-input" defaultChecked={editingCategory ? editingCategory.IsIncome : false} />
                  <label className="form-check-label">Income</label>
                </div>
                {editingCategory && (
                  <div className="form-check mt-2">
                    <input id="isActive" name="isActive" type="checkbox" className="form-check-input" defaultChecked={editingCategory.IsActive} />
                    <label className="form-check-label text-warning">Active</label>
                  </div>
                )}
              </div>
              <div className="col-md-9">
                <label className="form-label" htmlFor="description">Description</label>
                <input id="description" name="description" className="form-control" maxLength={500} defaultValue={editingCategory?.Description || ""} />
              </div>
              <div className="col-md-3 d-flex gap-2 justify-content-end align-items-end">
                {editingCategory && (
                  <Link href="/categories" className="btn btn-secondary w-100">Cancel</Link>
                )}
                <button type="submit" className="btn btn-primary w-100">{editingCategory ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle text-nowrap mb-0">
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
                      <div className="d-flex gap-2">
                        <Link href={`/categories?edit=${c.CategoryID}`} className="btn btn-sm btn-outline-primary">Edit</Link>
                        <form action={async () => { "use server"; await deleteCategory(c.CategoryID); }}>
                          <button type="submit" className="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}