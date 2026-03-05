"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPeople(formData: FormData, userId: number) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name || !email || !mobile || !password) {
    throw new Error("Name, Email, Mobile, and Password are required.");
  }

  await prisma.peoples.create({
    data: {
      PeopleName: name,
      Email: email,
      MobileNo: mobile,
      Password: password,
      PeopleCode: code || null,
      Description: description || null,
      UserID: userId,
      IsActive: true,
    },
  });

  revalidatePath("/people");
}

export async function deletePeople(id: number) {
  await prisma.peoples.delete({
    where: { PeopleID: id },
  });
  revalidatePath("/people");
}

export async function togglePeopleActive(id: number, isActive: boolean) {
  await prisma.peoples.update({
    where: { PeopleID: id },
    data: { IsActive: isActive },
  });
  revalidatePath("/people");
}

export async function updatePeople(id: number, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name || !email || !mobile) throw new Error("Required fields missing.");

  await prisma.peoples.update({
    where: { PeopleID: id },
    data: {
      PeopleName: name,
      Email: email,
      MobileNo: mobile,
      Password: password, // In production, hash this
      PeopleCode: code || null,
      Description: description || null,
    },
  });

  revalidatePath("/people");
}