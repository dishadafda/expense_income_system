"use server";

import { prisma } from "@/lib/prisma";

export async function getCategories() {
  const categories = await prisma.categories.findMany({
    where: { IsActive: true },
    orderBy: [{ Sequence: "asc" }, { CategoryName: "asc" }],
  });

  return categories;
}

export async function getProjects() {
  const projects = await prisma.projects.findMany({
    where: { IsActive: true },
    orderBy: [{ ProjectName: "asc" }],
  });

  return projects;
}

export async function getSubCategories() {
  const subCategories = await prisma.sub_categories.findMany({
    where: { IsActive: true },
    orderBy: [{ Sequence: "asc" }, { SubCategoryName: "asc" }],
  });

  return subCategories;
}

export async function getPeople() {
  const people = await prisma.peoples.findMany({
    where: { IsActive: true },
    orderBy: [{ PeopleName: "asc" }],
  });

  return people;
}

