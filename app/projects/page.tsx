import { getProjects } from "@/app/actions/catalog";
import { createProject, deleteProject, toggleProjectActive, updateProject } from "@/app/actions/projects";
import { getServerAuthSession } from "@/lib/auth";
import Link from "next/link";

export default async function ProjectsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);
  const isAdmin = role === "ADMIN";
  const projects = await getProjects(role, parentUserId);

  const editId = searchParams?.edit ? Number(searchParams.edit) : null;
  const editingProject = editId ? projects.find((p) => p.ProjectID === editId) : null;

  // Formatting dates for input type="date"
  const formatDateForInput = (dateString?: Date | null) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
  };

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
            <h2 className="h6 mb-3">{editingProject ? "Edit Project" : "Add Project"}</h2>
            <form action={editingProject ? updateProject.bind(null, editingProject.ProjectID) : handleCreate} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Project Name *</label>
                <input name="name" className="form-control" required defaultValue={editingProject?.ProjectName || ""} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Start Date</label>
                <input type="date" name="startDate" className="form-control" defaultValue={formatDateForInput(editingProject?.ProjectStartDate)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">End Date</label>
                <input type="date" name="endDate" className="form-control" defaultValue={formatDateForInput(editingProject?.ProjectEndDate)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Detail</label>
                <input name="detail" className="form-control" defaultValue={editingProject?.ProjectDetail || ""} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Description</label>
                <input name="description" className="form-control" defaultValue={editingProject?.Description || ""} />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                {editingProject && (
                  <Link href="/projects" className="btn btn-secondary">Cancel</Link>
                )}
                <button type="submit" className="btn btn-primary">{editingProject ? "Update Project" : "Save Project"}</button>
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
                        <Link href={`/projects?edit=${p.ProjectID}`} className="btn btn-sm btn-outline-primary">Edit</Link>
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
    </div>
  );
}