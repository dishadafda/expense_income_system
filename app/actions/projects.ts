"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";

const requireAdmin = async () => {
  const session = await getServerAuthSession();
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");
  return Number((session?.user as any)?.userId);
};

export async function createProject(formData: FormData) {
  const userId = await requireAdmin();
  await prisma.projects.create({
    data: {
      ProjectName: String(formData.get("name")).trim(),
      ProjectStartDate: formData.get("startDate") ? new Date(String(formData.get("startDate"))) : null,
      ProjectEndDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null,
      ProjectDetail: String(formData.get("detail")).trim() || null,
      Description: String(formData.get("description")).trim() || null,
      UserID: userId,
      IsActive: true,
    },
  });
  revalidatePath("/projects");
}

export async function deleteProject(id: number) {
  await requireAdmin();
  await prisma.projects.delete({ where: { ProjectID: id } });
  revalidatePath("/projects");
}

export async function toggleProjectActive(id: number, isActive: boolean) {
  await requireAdmin();
  await prisma.projects.update({ where: { ProjectID: id }, data: { IsActive: isActive } });
  revalidatePath("/projects");
}

export async function updateProject(id: number, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const startDateStr = String(formData.get("startDate") || "");
  const endDateStr = String(formData.get("endDate") || "");
  const detail = String(formData.get("detail") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name) throw new Error("Project name is required.");

  await prisma.projects.update({
    where: { ProjectID: id },
    data: {
      ProjectName: name,
      ProjectStartDate: startDateStr ? new Date(startDateStr) : null,
      ProjectEndDate: endDateStr ? new Date(endDateStr) : null,
      ProjectDetail: detail || null,
      Description: description || null,
    },
  });

  revalidatePath("/projects");
}
