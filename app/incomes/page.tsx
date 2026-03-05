import {
  getCategories,
  getProjects,
  getSubCategories,
  getPeople,
} from "@/app/actions/catalog";
import { deleteIncome, updateIncome } from "@/app/actions/incomes";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function IncomesPage({
  searchParams,
}: {
  searchParams: { categoryId?: string; projectId?: string; editId?: string };
}) {
  const session = await getServerAuthSession();
  const userId = Number((session?.user as any)?.userId || 0);
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const isAdmin = role === "ADMIN";

  if (!userId) {
    return <div className="alert alert-danger">Not authorized.</div>;
  }

  // Build where clause
  const whereClause: any = {};
  if (!isAdmin) {
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
  
  // Logic for Edit Mode
  const editItem = searchParams.editId 
    ? incomes.find(i => i.IncomeID === Number(searchParams.editId)) 
    : null;

  async function addIncome(formData: FormData) {
    "use server";
    const sessionInner = await getServerAuthSession();
    const roleInner = (sessionInner?.user as any)?.role;
    if (roleInner !== "ADMIN") return;

    const dateStr = String(formData.get("date") || "");
    const amountStr = String(formData.get("amount") || "");
    const peopleIdStr = String(formData.get("peopleId") || "");
    
    if (!dateStr || !amountStr || !peopleIdStr) return;

    const selectedPeopleId = Number(peopleIdStr);
    const selectedPeople = await prisma.peoples.findUnique({
      where: { PeopleID: selectedPeopleId },
    });

    await prisma.incomes.create({
      data: {
        IncomeDate: new Date(dateStr),
        Amount: parseFloat(amountStr),
        CategoryID: Number(formData.get("categoryId")) || null,
        SubCategoryID: Number(formData.get("subCategoryId")) || null,
        PeopleID: selectedPeopleId,
        ProjectID: Number(formData.get("projectId")) || null,
        IncomeDetail: String(formData.get("detail")).trim() || null,
        Description: String(formData.get("description")).trim() || null,
        UserID: selectedPeople?.UserID || userId,
      },
    });

    revalidatePath("/incomes");
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    if (!editItem) return;
    await updateIncome(editItem.IncomeID, formData);
    revalidatePath("/incomes");
  }

  return (
    <div>
      <h1 className="text-black h3 mb-4">Incomes Management</h1>

      {isAdmin && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-body">
            <h2 className="h6 mb-3">
              {editItem ? `Editing Income #${editItem.IncomeID}` : "Add Income for People"}
            </h2>
            <form action={editItem ? handleUpdate : addIncome} className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input 
                  name="date" 
                  type="date" 
                  className="form-control" 
                  defaultValue={editItem ? editItem.IncomeDate.toISOString().slice(0, 10) : ""}
                  required 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Amount</label>
                <input 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  className="form-control" 
                  defaultValue={editItem ? Number(editItem.Amount) : ""}
                  required 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Category</label>
                <select name="categoryId" className="form-select" defaultValue={editItem?.CategoryID || ""}>
                  <option value="">Select</option>
                  {incomeCategories.map((c) => (
                    <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">People</label>
                <select name="peopleId" className="form-select" defaultValue={editItem?.PeopleID || ""} required>
                  <option value="">Select</option>
                  {people.map((p) => (
                    <option key={p.PeopleID} value={p.PeopleID}>{p.PeopleName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Detail</label>
                <input name="detail" className="form-control" defaultValue={editItem?.IncomeDetail || ""} />
              </div>
              <div className="col-md-6 d-flex align-items-end justify-content-end gap-2">
                {editItem && (
                  <a href="/incomes" className="btn btn-outline-secondary">Cancel</a>
                )}
                <button type="submit" className={`btn ${editItem ? 'btn-success' : 'btn-primary'}`}>
                  {editItem ? "Update Income" : "Save Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Recent Incomes</h2>
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                {isAdmin && <th>People</th>}
                <th>Project</th>
                <th className="text-end">Amount</th>
                {isAdmin && <th className="text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {incomes.map((i) => (
                <tr key={i.IncomeID} className={editItem?.IncomeID === i.IncomeID ? "table-info" : ""}>
                  <td>{i.IncomeDate.toISOString().slice(0, 10)}</td>
                  <td>{i.categories?.CategoryName || "-"}</td>
                  {isAdmin && <td>{i.peoples?.PeopleName || "-"}</td>}
                  <td>{i.projects?.ProjectName || "-"}</td>
                  <td className="text-end">₹ {Number(i.Amount).toFixed(2)}</td>
                  {isAdmin && (
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <a 
                          href={`/incomes?editId=${i.IncomeID}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          Edit
                        </a>
                        <form action={deleteIncome}>
                          <input type="hidden" name="id" value={i.IncomeID} />
                          <button type="submit" className="btn btn-sm btn-outline-danger">
                            Delete
                          </button>
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
  );
}