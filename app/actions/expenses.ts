"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

export async function createExpense(formData: FormData) {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const peopleId = Number((session?.user as any)?.peopleId || 0);
  const parentUserId = Number((session?.user as any)?.parentUserId || 0);

  if (role !== "USER") {
    throw new Error("Only employees can add expenses");
  }

  if (!peopleId || !parentUserId) {
    throw new Error("Session invalid");
  }

  const dateStr = String(formData.get("date") || "");
  const amountStr = String(formData.get("amount") || "");
  if (!dateStr || !amountStr) {
    throw new Error("Date and amount are required");
  }

  const file = formData.get("attachment") as File | null;
  let attachmentPath = null;
  if (file && file.size > 0) {
    attachmentPath = await uploadFile(file);
  }

  await prisma.expenses.create({
    data: {
      ExpenseDate: new Date(dateStr),
      Amount: parseFloat(amountStr),
      CategoryID: Number(formData.get("categoryId")) || null,
      SubCategoryID: Number(formData.get("subCategoryId")) || null,
      PeopleID: peopleId,
      ProjectID: Number(formData.get("projectId")) || null,
      ExpenseDetail: String(formData.get("detail")) || null,
      AttachmentPath: attachmentPath,
      Description: String(formData.get("description")) || null,
      UserID: parentUserId,
    },
  });

  revalidatePath("/expenses");
}

export async function updateExpense(id: number, formData: FormData) {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const peopleId = Number((session?.user as any)?.peopleId || 0);

  if (role !== "USER") {
    throw new Error("Only employees can update expenses");
  }

  const existingExpense = await prisma.expenses.findUnique({
    where: { ExpenseID: id },
  });

  if (!existingExpense || existingExpense.PeopleID !== peopleId) {
    throw new Error("Unauthorized: You can only update your own expenses.");
  }

  const file = formData.get("attachment") as File | null;
  let attachmentPath = existingExpense.AttachmentPath;
  if (file && file.size > 0) {
    attachmentPath = await uploadFile(file);
  }

  await prisma.expenses.update({
    where: { ExpenseID: id },
    data: {
      ExpenseDate: new Date(String(formData.get("date"))),
      Amount: parseFloat(String(formData.get("amount"))),
      CategoryID: Number(formData.get("categoryId")) || null,
      SubCategoryID: Number(formData.get("subCategoryId")) || null,
      ProjectID: Number(formData.get("projectId")) || null,
      ExpenseDetail: String(formData.get("detail")) || null,
      AttachmentPath: attachmentPath,
      Description: String(formData.get("description")) || null,
    },
  });

  revalidatePath("/expenses");
}

export async function deleteExpense(id: number) {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as "ADMIN" | "USER";
  const peopleId = Number((session?.user as any)?.peopleId || 0);

  if (role !== "USER") {
    throw new Error("Unauthorized");
  }

  const existingExpense = await prisma.expenses.findUnique({
    where: { ExpenseID: id },
  });

  if (!existingExpense || existingExpense.PeopleID !== peopleId) {
    throw new Error("Unauthorized: You can only delete your own expenses.");
  }

  await prisma.expenses.delete({
    where: { ExpenseID: id },
  });

  revalidatePath("/expenses");
}