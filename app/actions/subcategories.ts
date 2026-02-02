"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSubCategory(formData: FormData, userId: number) {
  const categoryIdStr = String(formData.get("categoryId") || "");
  const name = String(formData.get("name") || "").trim();
  const isExpense = formData.get("isExpense") === "on";
  const isIncome = formData.get("isIncome") === "on";

  if (!categoryIdStr || !name) {
    throw new Error("Category and Sub-category name are required.");
  }

  await prisma.sub_categories.create({
    data: {
      CategoryID: Number(categoryIdStr),
      SubCategoryName: name,
      IsExpense: isExpense,
      IsIncome: isIncome,
      IsActive: true,
      UserID: userId,
    },
  });

  revalidatePath("/sub-categories");
}

export async function deleteSubCategory(id: number) {
  await prisma.sub_categories.delete({
    where: { SubCategoryID: id },
  });
  revalidatePath("/sub-categories");
}
