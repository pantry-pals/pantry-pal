'use server';

import { Condition, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { prisma } from './prisma';
import { sendVerificationEmail } from './mailer';

/**
 * Adds a new stuff to the database.
 * @param stuff, an object with the following properties: name, quantity, owner, condition.
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
  // After adding, redirect to the list page
  redirect('/list');
}

/**
 * Edits an existing stuff in the database.
 * @param stuff, an object with the following properties: id, name, quantity, owner, condition.
 */
export async function editStuff(stuff: Prisma.StuffUpdateInput & { id: number }) {
  await prisma.stuff.update({
    where: { id: stuff.id },
    data: stuff,
  });
}

/**
 * Deletes an existing stuff from the database.
 * @param id, the id of the stuff to delete.
 */
export async function deleteStuff(id: number) {
  // console.log(`deleteStuff id: ${id}`);
  await prisma.stuff.delete({
    where: { id },
  });
  // After deleting, redirect to the list page
  redirect('/list');
}

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function createUser({ email, password }: { email: string; password: string }) {
  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.emailVerificationToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  // Send email
  await sendVerificationEmail(email, token);

  return user;
}

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  // console.log(`changePassword data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}

/** * Adds a new produce to the database.
 * @param produce, an object with the following properties: name, type, location, quantity, expiration.
 */
export async function addProduce(produce: {
  name: string;
  type: string;
  location: string;
  quantity: number;
  expiration: string | Date;
  owner: string;
}) {
  await prisma.produce.create({
    data: {
      name: produce.name,
      type: produce.type,
      owner: produce.owner,
      location: produce.location,
      quantity: produce.quantity,
      expiration: new Date(produce.expiration),
    },
  });
  // After adding, redirect to the list page
  redirect('/list');
}
/** * Edits an existing produce in the database.
 * @param produce, an object with the following properties: id, name, type, location, quantity, expiration.
 */ export async function editProduce(produce: Prisma.ProduceUpdateInput & { id: number }) {
  await prisma.produce.update({
    where: { id: produce.id },
    data: {
      name: produce.name,
      type: produce.type,
      location: produce.location,
      quantity: produce.quantity,
      expiration: produce.expiration ? new Date(produce.expiration) : undefined,
      owner: produce.owner,
    },
  });
}
/** * Deletes an existing produce from the database.
 * @param id, the id of the produce to delete.
 */ export async function deleteProduce(id: number) {
  await prisma.produce.delete({
    where: { id },
  });
  // After deleting, redirect to the list page
  redirect('/list');
}
