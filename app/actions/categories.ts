"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData, userId: number) {
  const name = String(formData.get("name") || "").trim();
  const isExpense = formData.get("isExpense") === "on";
  const isIncome = formData.get("isIncome") === "on";

  if (!name) {
    throw new Error("Category name is required.");
  }

  await prisma.categories.create({
    data: {
      CategoryName: name,
      IsExpense: isExpense,
      IsIncome: isIncome,
      IsActive: true,
      UserID: userId,
    },
  });

  revalidatePath("/categories");
}

export async function deleteCategory(id: number) {
  await prisma.categories.delete({
    where: { CategoryID: id },
  });
  revalidatePath("/categories");
}

