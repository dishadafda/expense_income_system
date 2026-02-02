import { getProjects } from "@/app/actions/catalog";
import {
  createProject,
  deleteProject,
  toggleProjectActive,
} from "@/app/actions/projects";
import { getServerAuthSession } from "@/lib/auth";

export default async function ProjectsPage() {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER" | undefined;
  const userId = Number((session?.user as any)?.userId || 0);

  const isAdmin = role === "ADMIN";
  const projects = await getProjects();

  async function handleCreate(formData: FormData) {
    "use server";
    if (!isAdmin || !userId) return;
    await createProject(formData, userId);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    if (!isAdmin) return;
    const id = Number(formData.get("id"));
    if (!id) return;
    await deleteProject(id);
  }

  async function handleToggleActive(formData: FormData) {
    "use server";
    if (!isAdmin) return;
    const id = Number(formData.get("id"));
    const isActive = formData.get("isActive") === "true";
    if (!id) return;
    await toggleProjectActive(id, isActive);
  }

  return (
    <div>
      <h1 className="h3 mb-4 text-black">Projects Management</h1>

      {isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">Add Project</h2>
            <form action={handleCreate} className="row g-3">
              <div className="col-md-3">
                <label className="form-label" htmlFor="name">
                  Project Name <span className="text-danger">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="form-control"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="endDate">
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className="form-control"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="detail">
                  Project Detail
                </label>
                <input id="detail" name="detail" className="form-control" />
              </div>
              <div className="col-md-12">
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
                  Save Project
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
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Active</th>
                {isAdmin && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.ProjectID}>
                  <td>{p.ProjectID}</td>
                  <td>{p.ProjectName}</td>
                  <td>
                    {p.ProjectStartDate
                      ? new Date(p.ProjectStartDate).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td>
                    {p.ProjectEndDate
                      ? new Date(p.ProjectEndDate).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td>
                    {p.IsActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="d-flex gap-2">
                        <form action={handleToggleActive}>
                          <input
                            type="hidden"
                            name="id"
                            value={p.ProjectID}
                          />
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
                          <input
                            type="hidden"
                            name="id"
                            value={p.ProjectID}
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
              {projects.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted">
                    No projects found.
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

