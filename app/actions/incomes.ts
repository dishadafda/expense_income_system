"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

/** * Action to Delete Income 
 * Strictly restricted to ADMIN role
 */
export async function deleteIncome(formData: FormData) {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can delete records.");
  }

  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.incomes.delete({
    where: { IncomeID: id },
  });

  revalidatePath("/incomes");
}

/** * Action to Update Income 
 * Strictly restricted to ADMIN role
 */
export async function updateIncome(id: number, formData: FormData) {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can update records.");
  }

  const amount = parseFloat(String(formData.get("amount")));
  const date = new Date(String(formData.get("date")));

  const file = formData.get("attachment") as File | null;
  
  const existingIncome = await prisma.incomes.findUnique({ where: { IncomeID: id } });
  let attachmentPath = existingIncome?.AttachmentPath || null;
  if (file && file.size > 0) {
    attachmentPath = await uploadFile(file);
  }

  await prisma.incomes.update({
    where: { IncomeID: id },
    data: {
      IncomeDate: date,
      Amount: amount,
      CategoryID: Number(formData.get("categoryId")) || null,
      SubCategoryID: Number(formData.get("subCategoryId")) || null,
      PeopleID: Number(formData.get("peopleId")),
      ProjectID: Number(formData.get("projectId")) || null,
      IncomeDetail: String(formData.get("detail")).trim() || null,
      AttachmentPath: attachmentPath,
      Description: String(formData.get("description")).trim() || null,
    },
  });

  revalidatePath("/incomes");
}