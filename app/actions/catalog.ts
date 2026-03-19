"use server";

import { prisma } from "@/lib/prisma";

export async function getCategories(
  role: "ADMIN" | "USER",
  parentUserId: number,
  filterUserId?: number
) {
  const where =
    role === "ADMIN"
      ? filterUserId
        ? { UserID: filterUserId }
        : {}
      : { UserID: parentUserId };
  return await prisma.categories.findMany({
    where,
    orderBy: [{ Sequence: "asc" }, { CategoryName: "asc" }],
  });
}

export async function getSubCategories(
  role: "ADMIN" | "USER",
  parentUserId: number,
  filterUserId?: number
) {
  const where =
    role === "ADMIN"
      ? filterUserId
        ? { UserID: filterUserId }
        : {}
      : { UserID: parentUserId };
  return await prisma.sub_categories.findMany({
    where,
    include: { categories: true },
    orderBy: [{ Sequence: "asc" }, { SubCategoryName: "asc" }],
  });
}

export async function getProjects(role: "ADMIN" | "USER", parentUserId: number) {
  const where =
    role === "ADMIN" ? {} : { UserID: parentUserId, IsActive: true };
  return await prisma.projects.findMany({
    where,
    orderBy: [{ ProjectName: "asc" }],
  });
}

export async function getPeople(role: "ADMIN" | "USER", parentUserId: number) {
  const where = role === "ADMIN" ? {} : { UserID: parentUserId };
  return await prisma.peoples.findMany({
    where,
    orderBy: [{ PeopleName: "asc" }],
  });
}

export async function getAllIncomes(
  role: "ADMIN" | "USER",
  peopleId: number,
  parentUserId: number,
  filterUserId?: number,
  filterCategoryId?: number,
  filterProjectId?: number
) {
  const baseWhere: any =
    role === "ADMIN"
      ? filterUserId
        ? { UserID: filterUserId }
        : {}
      : { PeopleID: peopleId };
  if (filterCategoryId) baseWhere.CategoryID = filterCategoryId;
  if (filterProjectId) baseWhere.ProjectID = filterProjectId;
  return await prisma.incomes.findMany({
    where: baseWhere,
    include: { categories: true, sub_categories: true, projects: true, peoples: true },
    orderBy: { IncomeDate: "desc" },
    take: 50,
  });
}

export async function getAllExpenses(
  role: "ADMIN" | "USER",
  peopleId: number,
  parentUserId: number,
  filterUserId?: number,
  filterCategoryId?: number,
  filterProjectId?: number
) {
  const baseWhere: any =
    role === "ADMIN"
      ? filterUserId
        ? { UserID: filterUserId }
        : {}
      : { PeopleID: peopleId };
  if (filterCategoryId) baseWhere.CategoryID = filterCategoryId;
  if (filterProjectId) baseWhere.ProjectID = filterProjectId;
  return await prisma.expenses.findMany({
    where: baseWhere,
    include: { categories: true, sub_categories: true, projects: true, peoples: true },
    orderBy: { ExpenseDate: "desc" },
    take: 50,
  });
}