"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "@/lib/auth";

export async function createCategory(formData: FormData) {
  const session = await getServerAuthSession();
  const userId = Number((session?.user as any)?.userId || 0);
  if ((session?.user as any)?.role !== "USER") throw new Error("Only users can manage categories.");

  await prisma.categories.create({
    data: {
      CategoryName: String(formData.get("name")).trim(),
      IsExpense: formData.get("isExpense") === "on",
      IsIncome: formData.get("isIncome") === "on",
      IsActive: true,
      UserID: userId,
    },
  });
  revalidatePath("/categories");
}

export async function deleteCategory(id: number) {
  const session = await getServerAuthSession();
  if ((session?.user as any)?.role !== "USER") return;
  await prisma.categories.delete({ where: { CategoryID: id } });
  revalidatePath("/categories");
}

export async function updateCategory(id: number, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const isExpense = formData.get("isExpense") === "on";
  const isIncome = formData.get("isIncome") === "on";
  const isActive = formData.get("isActive") === "on";

  if (!name) throw new Error("Category name is required.");

  await prisma.categories.update({
    where: { CategoryID: id },
    data: {
      CategoryName: name,
      IsExpense: isExpense,
      IsIncome: isIncome,
      IsActive: isActive,
    },
  });

  revalidatePath("/categories");
}

