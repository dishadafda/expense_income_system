"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";

export async function createSubCategory(formData: FormData) {
  const session = await getServerAuthSession();
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);

  if ((session?.user as any)?.role !== "USER") {
    throw new Error("Only users can manage sub-categories.");
  }

  const categoryIdStr = String(formData.get("categoryId") || "");
  const name = String(formData.get("name") || "").trim().slice(0, 250);
  const description = String(formData.get("description") || "").trim().slice(0, 500) || null;
  const logoPath = String(formData.get("logoPath") || "").trim().slice(0, 250) || null;
  const isExpense = formData.get("isExpense") === "on";
  const isIncome = formData.get("isIncome") === "on";

  if (!categoryIdStr || !name) {
    throw new Error("Category and Sub-category name are required.");
  }

  await prisma.sub_categories.create({
    data: {
      CategoryID: Number(categoryIdStr),
      SubCategoryName: name,
      Description: description,
      LogoPath: logoPath,
      IsExpense: isExpense,
      IsIncome: isIncome,
      IsActive: true,
      UserID: parentUserId,
    },
  });

  revalidatePath("/sub-categories");
}

export async function deleteSubCategory(id: number) {
  const session = await getServerAuthSession();
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);

  if ((session?.user as any)?.role !== "USER") {
    throw new Error("Unauthorized");
  }

  const existingSub = await prisma.sub_categories.findUnique({
    where: { SubCategoryID: id },
  });

  if (!existingSub || existingSub.UserID !== parentUserId) {
    throw new Error("Unauthorized: You can only delete your own sub-categories.");
  }

  await prisma.sub_categories.delete({
    where: { SubCategoryID: id },
  });
  
  revalidatePath("/sub-categories");
}

export async function updateSubCategory(id: number, formData: FormData) {
  const session = await getServerAuthSession();
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);

  if ((session?.user as any)?.role !== "USER") {
    throw new Error("Unauthorized");
  }

  const existingSub = await prisma.sub_categories.findUnique({
    where: { SubCategoryID: id },
  });

  if (!existingSub || existingSub.UserID !== parentUserId) {
    throw new Error("Unauthorized: You can only update your own sub-categories.");
  }

  const categoryIdStr = String(formData.get("categoryId") || "");
  const name = String(formData.get("name") || "").trim().slice(0, 250);
  const description = String(formData.get("description") || "").trim().slice(0, 500) || null;
  const logoPath = String(formData.get("logoPath") || "").trim().slice(0, 250) || null;
  const isExpense = formData.get("isExpense") === "on";
  const isIncome = formData.get("isIncome") === "on";
  const isActive = formData.get("isActive") === "on";

  if (!categoryIdStr || !name) throw new Error("Required fields missing.");

  await prisma.sub_categories.update({
    where: { SubCategoryID: id },
    data: {
      CategoryID: Number(categoryIdStr),
      SubCategoryName: name,
      Description: description,
      LogoPath: logoPath,
      IsExpense: isExpense,
      IsIncome: isIncome,
      IsActive: isActive,
    },
  });

  revalidatePath("/sub-categories");
}