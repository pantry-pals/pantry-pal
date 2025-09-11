'use server';

import { Condition, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { prisma } from './prisma';
import { sendVerificationEmail } from './mailer';

/**
 * Adds a new stuff to the database.
 */
export async function addStuff(stuff: { name: string; quantity: number; owner: string; condition: string }) {
  const inputCondition = stuff.condition.toLowerCase() as Condition;
  const condition: Condition = ['poor', 'fair', 'excellent', 'good'].includes(inputCondition)
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

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.emailVerificationToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  await sendVerificationEmail(email, token);

  return user;
}

/**
 * Changes a user's password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: { password },
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
}) {
  await prisma.produce.create({
    data: {
      name: produce.name,
      type: produce.type,
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
  let expiration: Date | Prisma.DateTimeFieldUpdateOperationsInput | null | undefined;

  if (produce.expiration) {
    if (produce.expiration instanceof Date) {
      expiration = produce.expiration;
    } else if (typeof produce.expiration === 'string' || typeof produce.expiration === 'number') {
      expiration = new Date(produce.expiration);
    } else {
      // already a Prisma field update input
      expiration = produce.expiration as Prisma.DateTimeFieldUpdateOperationsInput;
    }
  } else {
    expiration = null;
  }

  await prisma.produce.update({
    where: { id: produce.id },
    data: {
      name: produce.name,
      type: produce.type,
      location: produce.location,
      quantity: produce.quantity,
      expiration,
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
