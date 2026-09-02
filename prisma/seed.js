// Script optionnel : crée un premier utilisateur admin pour tester rapidement.
// Lancer avec : npm run db:seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "demo@cinelist.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Utilisateur demo déjà présent.");
    return;
  }
  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.create({
    data: { name: "Demo", email, passwordHash },
  });
  console.log("Utilisateur créé : demo@cinelist.local / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
