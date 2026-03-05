"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";

export async function createExpense(formData: FormData) {
  const session = await getServerAuthSession();
  const userId = Number((session?.user as any)?.userId || 0);
  
  if ((session?.user as any)?.role !== "USER") {
    throw new Error("Only users can add expenses");
  }

  await prisma.expenses.create({
    data: {
      ExpenseDate: new Date(String(formData.get("date"))),
      Amount: parseFloat(String(formData.get("amount"))),
      CategoryID: Number(formData.get("categoryId")) || null,
      SubCategoryID: Number(formData.get("subCategoryId")) || null,
      PeopleID: Number(formData.get("peopleId")),
      ProjectID: Number(formData.get("projectId")) || null,
      ExpenseDetail: String(formData.get("detail")) || null,
      Description: String(formData.get("description")) || null,
      UserID: userId,
    },
  });
  
  revalidatePath("/expenses");
}

export async function updateExpense(id: number, formData: FormData) {
  const session = await getServerAuthSession();
  const userId = Number((session?.user as any)?.userId || 0);

  if ((session?.user as any)?.role !== "USER") {
    throw new Error("Only users can update expenses");
  }

  // Verify ownership before updating
  const existingExpense = await prisma.expenses.findUnique({
    where: { ExpenseID: id },
  });

  if (!existingExpense || existingExpense.UserID !== userId) {
    throw new Error("Unauthorized: You can only update your own expenses.");
  }

  await prisma.expenses.update({
    where: { ExpenseID: id },
    data: {
      ExpenseDate: new Date(String(formData.get("date"))),
      Amount: parseFloat(String(formData.get("amount"))),
      CategoryID: Number(formData.get("categoryId")) || null,
      SubCategoryID: Number(formData.get("subCategoryId")) || null,
      PeopleID: Number(formData.get("peopleId")),
      ProjectID: Number(formData.get("projectId")) || null,
      ExpenseDetail: String(formData.get("detail")) || null,
      Description: String(formData.get("description")) || null,
    },
  });

  revalidatePath("/expenses");
}

export async function deleteExpense(id: number) {
  const session = await getServerAuthSession();
  const userId = Number((session?.user as any)?.userId || 0);

  if ((session?.user as any)?.role !== "USER") {
    throw new Error("Unauthorized");
  }

  // Verify ownership before deleting
  const existingExpense = await prisma.expenses.findUnique({
    where: { ExpenseID: id },
  });

  if (!existingExpense || existingExpense.UserID !== userId) {
    throw new Error("Unauthorized: You can only delete your own expenses.");
  }

  await prisma.expenses.delete({ 
    where: { ExpenseID: id } 
  });
  
  revalidatePath("/expenses");
}