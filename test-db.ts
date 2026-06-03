import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const existing = await prisma.users.findFirst({ where: { EmailAddress: "dishadafda99@gmail.com" }});
    if (!existing) {
      await prisma.users.create({
        data: {
          UserName: "admin",
          EmailAddress: "dishadafda99@gmail.com",
          Password: "Disha$22052006",
          MobileNo: "9904118203",
          Created: new Date(),
          Modified: new Date()
        }
      });
      console.log("SUCCESSFULLY INSERTED VIA PRISMA!");
    } else {
      console.log("USER ALREADY EXISTS:", existing);
    }
  } catch (e: any) {
    console.log("ERROR CAUGHT:", e.message);
  }
  
  const users = await prisma.users.findMany();
  console.log("Current Users Table Data:", users);
}

main().finally(() => prisma.$disconnect());
