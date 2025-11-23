import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    console.log(user.email);
  }
  
  const giftCard = await prisma.giftCard.findFirst();
  if (giftCard) {
    console.log(giftCard.code);
  }
}

main();
