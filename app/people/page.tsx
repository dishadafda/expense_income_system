import { getPeople } from "@/app/actions/catalog";
import {
  createPeople,
  deletePeople,
  togglePeopleActive,
} from "@/app/actions/people";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PeoplePage() {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const userId = Number((session?.user as any)?.userId || 0);

  const isAdmin = role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="alert alert-warning">
        Only administrators can manage people.
      </div>
    );
  }

  const people = await prisma.peoples.findMany({
    include: {
      users: true,
    },
    orderBy: [{ PeopleName: "asc" }],
  });

  async function handleCreate(formData: FormData) {
    "use server";
    if (!isAdmin || !userId) return;
    await createPeople(formData, userId);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    if (!isAdmin) return;
    const id = Number(formData.get("id"));
    if (!id) return;
    await deletePeople(id);
  }

  async function handleToggleActive(formData: FormData) {
    "use server";
    if (!isAdmin) return;
    const id = Number(formData.get("id"));
    const isActive = formData.get("isActive") === "true";
    if (!id) return;
    await togglePeopleActive(id, isActive);
  }

  return (
    <div>
      <h1 className="h3 mb-4 text-black">People Management</h1>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">Add Person</h2>
          <form action={handleCreate} className="row g-3">
            <div className="col-md-3">
              <label className="form-label" htmlFor="name">
                Name <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                name="name"
                className="form-control"
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="email">
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="mobile">
                Mobile <span className="text-danger">*</span>
              </label>
              <input
                id="mobile"
                name="mobile"
                className="form-control"
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="password">
                Password <span className="text-danger">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="code">
                People Code
              </label>
              <input id="code" name="code" className="form-control" />
            </div>
            <div className="col-md-9">
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
                Save Person
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
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Mobile</th>
                <th scope="col">Code</th>
                <th scope="col">Active</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.PeopleID}>
                  <td>{p.PeopleID}</td>
                  <td>{p.PeopleName}</td>
                  <td>{p.Email}</td>
                  <td>{p.MobileNo}</td>
                  <td>{p.PeopleCode || "-"}</td>
                  <td>
                    {p.IsActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <form action={handleToggleActive}>
                        <input type="hidden" name="id" value={p.PeopleID} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={p.IsActive ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className={`btn btn-sm ${
                            p.IsActive
                              ? "btn-outline-warning"
                              : "btn-outline-success"
                          }`}
                        >
                          {p.IsActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={p.PeopleID} />
                        <button
                          type="submit"
                          className="btn btn-sm btn-outline-danger"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {people.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No people found.
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
