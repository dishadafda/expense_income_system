"use server";

import { prisma } from "@/lib/prisma";

export async function getCategories(role: "ADMIN" | "USER", userId: number, filterUserId?: number) {
  const where = role === "ADMIN" ? (filterUserId ? { UserID: filterUserId } : {}) : { UserID: userId };
  return await prisma.categories.findMany({
    where,
    orderBy: [{ Sequence: "asc" }, { CategoryName: "asc" }],
  });
}

export async function getSubCategories(role: "ADMIN" | "USER", userId: number, filterUserId?: number) {
  const where = role === "ADMIN" ? (filterUserId ? { UserID: filterUserId } : {}) : { UserID: userId };
  return await prisma.sub_categories.findMany({
    where,
    include: { categories: true },
    orderBy: [{ Sequence: "asc" }, { SubCategoryName: "asc" }],
  });
}

export async function getProjects(role: "ADMIN" | "USER") {
  const where = role === "ADMIN" ? {} : { IsActive: true };
  return await prisma.projects.findMany({
    where,
    orderBy: [{ ProjectName: "asc" }],
  });
}

export async function getPeople(role: "ADMIN" | "USER", userId: number) {
  const where = role === "ADMIN" ? {} : { UserID: userId };
  return await prisma.peoples.findMany({
    where,
    orderBy: [{ PeopleName: "asc" }],
  });
}

export async function getAllIncomes(role: "ADMIN" | "USER", userId: number) {
  const where = role === "ADMIN" ? {} : { UserID: userId };
  return await prisma.incomes.findMany({
    where,
    include: { categories: true, sub_categories: true, projects: true, peoples: true },
    orderBy: { IncomeDate: "desc" },
  });
}

export async function getAllExpenses(role: "ADMIN" | "USER", userId: number, filterUserId?: number) {
  const where = role === "ADMIN" ? (filterUserId ? { UserID: filterUserId } : {}) : { UserID: userId };
  return await prisma.expenses.findMany({
    where,
    include: { categories: true, sub_categories: true, projects: true, peoples: true },
    orderBy: { ExpenseDate: "desc" },
  });
}