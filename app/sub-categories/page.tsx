import { getCategories, getSubCategories } from "@/app/actions/catalog";
import {
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
} from "@/app/actions/subcategories";
import { getServerAuthSession } from "@/lib/auth";
import Link from "next/link";

export default async function SubCategoriesPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);

  const isUser = role === "USER";
  const isAdmin = role === "ADMIN";

  const [categories, subCategories] = await Promise.all([
    getCategories(role, parentUserId),
    getSubCategories(role, parentUserId),
  ]);

  const editId = searchParams?.edit ? Number(searchParams.edit) : null;
  const editingSubCategory = editId ? subCategories.find((s) => s.SubCategoryID === editId) : null;

  async function handleCreate(formData: FormData) {
    "use server";
    if (!isUser || !parentUserId) return;
    await createSubCategory(formData);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    // Only users can execute this action
    if (!isUser) return;
    const id = Number(formData.get("id"));
    if (!id) return;
    await deleteSubCategory(id);
  }

  return (
    <div className="app-page w-100">
      <h1 className="h3 mb-4 text-black">
        Sub-Categories {isAdmin && "(View Only)"}
      </h1>

      {/* ONLY RENDER THE ADD FORM FOR USERS */}
      {isUser && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">{editingSubCategory ? "Edit Sub-Category" : "Add Sub-Category"}</h2>
            <form action={editingSubCategory ? updateSubCategory.bind(null, editingSubCategory.SubCategoryID) : handleCreate} className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label" htmlFor="categoryId">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="form-select"
                  required
                  defaultValue={editingSubCategory?.CategoryID || ""}
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
                  defaultValue={editingSubCategory?.SubCategoryName || ""}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="logoPath">Logo Path</label>
                <input id="logoPath" name="logoPath" className="form-control" maxLength={250} defaultValue={editingSubCategory?.LogoPath || ""} />
              </div>
              <div className="col-md-2">
                <div className="form-check">
                  <input
                    id="isExpense"
                    name="isExpense"
                    type="checkbox"
                    className="form-check-input"
                    defaultChecked={editingSubCategory ? editingSubCategory.IsExpense : true}
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
                    defaultChecked={editingSubCategory ? editingSubCategory.IsIncome : false}
                  />
                  <label className="form-check-label" htmlFor="isIncome">
                    Income
                  </label>
                </div>
                {editingSubCategory && (
                  <div className="form-check mt-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      className="form-check-input"
                      defaultChecked={editingSubCategory.IsActive}
                    />
                    <label className="form-check-label text-warning" htmlFor="isActive">
                      Active
                    </label>
                  </div>
                )}
              </div>
              <div className="col-md-9">
                <label className="form-label" htmlFor="description">Description</label>
                <input id="description" name="description" className="form-control" maxLength={500} defaultValue={editingSubCategory?.Description || ""} />
              </div>
              <div className="col-md-3 d-flex gap-2 justify-content-end align-items-end">
                {editingSubCategory && (
                  <Link href="/sub-categories" className="btn btn-secondary w-100">Cancel</Link>
                )}
                <button type="submit" className="btn btn-primary w-100">
                  {editingSubCategory ? "Update" : "Save"}
                </button>
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
                <th scope="col">ID</th>
                <th scope="col">Category</th>
                <th scope="col">Sub-Category Name</th>
                <th scope="col">Type</th>
                <th scope="col">Active</th>
                {/* ONLY SHOW ACTIONS COLUMN FOR USERS */}
                {isUser && <th scope="col">Actions</th>}
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
                  
                  {/* ONLY RENDER THE DELETE BUTTON FOR USERS */}
                  {isUser && (
                    <td>
                      <div className="d-flex gap-2">
                        <Link href={`/sub-categories?edit=${s.SubCategoryID}`} className="btn btn-sm btn-outline-primary">Edit</Link>
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
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {subCategories.length === 0 && (
                <tr>
                  <td colSpan={isUser ? 6 : 5} className="text-center text-muted">
                    No sub-categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}