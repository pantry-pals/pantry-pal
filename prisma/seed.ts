import { PrismaClient, Role, Condition } from '@prisma/client';
import { hash } from 'bcrypt';
import * as config from '../config/settings.development.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database');
  const password = await hash('changeme', 10);

  // Seed users
  for (const account of config.defaultAccounts) {
    const role = (account.role as Role) || Role.USER;
    console.log(`  Creating user: ${account.email} with role: ${role}`);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password,
        role,
        emailVerified: false,
      },
    });
  }

  // Seed stuff
  for (let index = 0; index < config.defaultData.length; index++) {
    const data = config.defaultData[index];
    const condition = (data.condition as Condition) || Condition.good;
    console.log(`  Adding stuff: ${JSON.stringify(data)}`);

    await prisma.stuff.upsert({
      where: { id: index + 1 },
      update: {},
      create: {
        name: data.name,
        quantity: data.quantity,
        owner: data.owner,
        condition,
      },
    });
  }

  // Seed produce
  for (let index = 0; index < config.defaultProduce.length; index++) {
    const produce = config.defaultProduce[index];
    console.log(`  Adding produce: ${JSON.stringify(produce)}`);

    await prisma.produce.upsert({
      where: { id: index + 1 },
      update: {},
      create: {
        name: produce.name,
        type: produce.type,
        location: produce.location,
        quantity: produce.quantity,
        expiration: new Date(produce.expiration),
      },
    });
  }

  console.log('Seeding complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
