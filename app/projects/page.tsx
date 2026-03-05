import { getProjects } from "@/app/actions/catalog";
import { createProject, deleteProject, toggleProjectActive } from "@/app/actions/projects";
import { getServerAuthSession } from "@/lib/auth";

export default async function ProjectsPage() {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const isAdmin = role === "ADMIN";
  const projects = await getProjects(role);

  async function handleCreate(formData: FormData) {
    "use server";
    await createProject(formData);
  }

  return (
    <div>
      <h1 className="h3 mb-4 text-black">{isAdmin ? "Projects Management" : "Active Projects"}</h1>

      {isAdmin && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h6 mb-3">Add Project</h2>
            <form action={handleCreate} className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Project Name *</label>
                <input name="name" className="form-control" required />
              </div>
              <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary">Save Project</button>
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
                <th>Name</th><th>Start Date</th><th>End Date</th>
                {isAdmin && <th>Active</th>}
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.ProjectID}>
                  <td>{p.ProjectName}</td>
                  <td>{p.ProjectStartDate ? new Date(p.ProjectStartDate).toISOString().slice(0, 10) : "-"}</td>
                  <td>{p.ProjectEndDate ? new Date(p.ProjectEndDate).toISOString().slice(0, 10) : "-"}</td>
                  {isAdmin && (
                    <td>{p.IsActive ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>}</td>
                  )}
                  {isAdmin && (
                    <td>
                      <div className="d-flex gap-2">
                        <form action={async () => { "use server"; await toggleProjectActive(p.ProjectID, !p.IsActive); }}>
                          <button type="submit" className={`btn btn-sm ${p.IsActive ? "btn-outline-warning" : "btn-outline-success"}`}>
                            {p.IsActive ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                        <form action={async () => { "use server"; await deleteProject(p.ProjectID); }}>
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
  );
}