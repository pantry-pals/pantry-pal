'use server';

import { Condition, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Adds a new stuff to the database.
 */
export async function addStuff(stuff: { name: string; quantity: number; owner: string; condition: string }) {
  const inputCondition = stuff.condition.toLowerCase() as Condition;
  const condition: Condition = ['poor', 'fair', 'good', 'excellent'].includes(inputCondition)
    ? (inputCondition as Condition)
    : 'good';

  await prisma.stuff.create({
    data: {
      name: stuff.name,
      quantity: stuff.quantity,
      owner: stuff.owner,
      condition,
    },
  });

  redirect('/list');
}

/**
 * Edits an existing stuff.
 */
export async function editStuff(stuff: Prisma.StuffUpdateInput & { id: number }) {
  await prisma.stuff.update({
    where: { id: stuff.id },
    data: stuff,
  });
}

/**
 * Deletes a stuff by id.
 */
export async function deleteStuff(id: number) {
  await prisma.stuff.delete({
    where: { id },
  });

  redirect('/list');
}

/**
 * Creates a new user.
 */
export async function createUser({ email, password }: { email: string; password: string }) {
  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return user;
}

/**
 * Changes a user's password.
 */
export async function changePassword({ email, password }: { email: string; password: string }) {
  const hashedPassword = await hash(password, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
}

/**
 * Adds a new produce.
 */
export async function addProduce(produce: {
  name: string;
  type: string;
  location: string;
  quantity: number;
  expiration: string | Date | null;
  owner: string;
}) {
  await prisma.produce.create({
    data: {
      name: produce.name,
      type: produce.type,
      owner: produce.owner,
      location: produce.location,
      quantity: produce.quantity,
      expiration: produce.expiration ? new Date(produce.expiration) : null,
    },
  });

  redirect('/list');
}

/**
 * Edits an existing produce.
 */
export async function editProduce(produce: Prisma.ProduceUpdateInput & { id: number }) {
  let expiration: Date | Prisma.DateTimeFieldUpdateOperationsInput | null | undefined = null;

  if (produce.expiration) {
    if (produce.expiration instanceof Date) {
      expiration = produce.expiration;
    } else if (typeof produce.expiration === 'string' || typeof produce.expiration === 'number') {
      expiration = new Date(produce.expiration);
    } else {
      expiration = produce.expiration as Prisma.DateTimeFieldUpdateOperationsInput;
    }
  }

  await prisma.produce.update({
    where: { id: produce.id },
    data: {
      name: produce.name,
      type: produce.type,
      location: produce.location,
      quantity: produce.quantity,
      expiration,
      owner: produce.owner,
    },
  });
}

/**
 * Deletes a produce by id.
 */
export async function deleteProduce(id: number) {
  await prisma.produce.delete({
    where: { id },
  });

  redirect('/list');
}
