"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";

export async function createCategory(formData: FormData) {
  const session = await getServerAuthSession();
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);
  if ((session?.user as any)?.role !== "USER") throw new Error("Only users can manage categories.");

  await prisma.categories.create({
    data: {
      CategoryName: String(formData.get("name")).trim().slice(0, 250),
      Description: String(formData.get("description") || "").trim().slice(0, 500) || null,
      LogoPath: String(formData.get("logoPath") || "").trim().slice(0, 250) || null,
      IsExpense: formData.get("isExpense") === "on",
      IsIncome: formData.get("isIncome") === "on",
      IsActive: true,
      UserID: parentUserId,
    },
  });
  revalidatePath("/categories");
}

export async function deleteCategory(id: number) {
  const session = await getServerAuthSession();
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);
  if ((session?.user as any)?.role !== "USER") return;
  const existing = await prisma.categories.findUnique({ where: { CategoryID: id } });
  if (!existing || existing.UserID !== parentUserId) throw new Error("Unauthorized");
  await prisma.categories.delete({ where: { CategoryID: id } });
  revalidatePath("/categories");
}

export async function updateCategory(id: number, formData: FormData) {
  const session = await getServerAuthSession();
  const parentUserId = Number((session?.user as any)?.parentUserId || (session?.user as any)?.userId || 0);

  if ((session?.user as any)?.role !== "USER") {
    throw new Error("Unauthorized");
  }

  const existingCat = await prisma.categories.findUnique({
    where: { CategoryID: id },
  });

  if (!existingCat || existingCat.UserID !== parentUserId) {
    throw new Error("Unauthorized: You can only update your own categories.");
  }

  const name = String(formData.get("name") || "").trim().slice(0, 250);
  const description = String(formData.get("description") || "").trim().slice(0, 500) || null;
  const logoPath = String(formData.get("logoPath") || "").trim().slice(0, 250) || null;
  const isExpense = formData.get("isExpense") === "on";
  const isIncome = formData.get("isIncome") === "on";
  const isActive = formData.get("isActive") === "on";

  if (!name) throw new Error("Category name is required.");

  await prisma.categories.update({
    where: { CategoryID: id },
    data: {
      CategoryName: name,
      Description: description,
      LogoPath: logoPath,
      IsExpense: isExpense,
      IsIncome: isIncome,
      IsActive: isActive,
    },
  });

  revalidatePath("/categories");
}

