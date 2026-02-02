"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData, userId: number) {
  const name = String(formData.get("name") || "").trim();
  const startDateStr = String(formData.get("startDate") || "");
  const endDateStr = String(formData.get("endDate") || "");
  const detail = String(formData.get("detail") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name) {
    throw new Error("Project name is required.");
  }

  await prisma.projects.create({
    data: {
      ProjectName: name,
      ProjectStartDate: startDateStr ? new Date(startDateStr) : null,
      ProjectEndDate: endDateStr ? new Date(endDateStr) : null,
      ProjectDetail: detail || null,
      Description: description || null,
      UserID: userId,
      IsActive: true,
    },
  });

  revalidatePath("/projects");
}

export async function deleteProject(id: number) {
  await prisma.projects.delete({
    where: { ProjectID: id },
  });
  revalidatePath("/projects");
}

export async function toggleProjectActive(id: number, isActive: boolean) {
  await prisma.projects.update({
    where: { ProjectID: id },
    data: { IsActive: isActive },
  });
  revalidatePath("/projects");
}
