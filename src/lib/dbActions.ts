'use server';

import { Condition, Prisma } from '@prisma/client';
import { hash, compare } from 'bcrypt';
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
 * Changes a user's password, checking the old password.
 */
export async function changePassword({
  email,
  oldPassword,
  newPassword,
}: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  const match = await compare(oldPassword, user.password);
  if (!match) {
    return { success: false, message: 'Old password is incorrect.' };
  }

  if (oldPassword === newPassword) {
    return { success: false, message: 'New password must be different from old password.' };
  }

  if (newPassword.length < 6 || newPassword.length > 40) {
    return { success: false, message: 'Password must be between 6 and 40 characters.' };
  }

  const hashedPassword = await hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return { success: true };
}

export async function addProduce(produce: {
  productId: number;
  userId: number;
  location: string;
  quantity: number;
  expiration?: string | Date | null;
  image: string | null;
}) {
  await prisma.produce.create({
    data: {
      productId: produce.productId,
      userId: produce.userId,
      location: produce.location,
      quantity: produce.quantity,
      expiration: produce.expiration ? new Date(produce.expiration) : null,
      image: produce.image ? produce.image : null,
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
      productId: produce.productId,
      userId: produce.userId,
      location: produce.location,
      quantity: produce.quantity,
      expiration,
      image: produce.image,
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

/**
 * Creates a new shopping list.
 */
export async function createShoppingList(list: {
  name: string;
  userId: number;
}) {
  const shoppingList = await prisma.shoppingList.create({
    data: {
      name: list.name,
      userId: list.userId,
    },
  });

  return shoppingList;
}

/**
 * Edits an existing shopping list.
 */
export async function editShoppingList(list: {
  id: number;
  name: string;
}) {
  await prisma.shoppingList.update({
    where: { id: list.id },
    data: {
      name: list.name,
    },
  });
}

/**
 * Deletes a shopping list by id.
 */
export async function deleteShoppingList(id: number) {
  await prisma.shoppingList.delete({
    where: { id },
  });
}

/**
 * Adds a new item to a shopping list.
 */
export async function addShoppingListItem(item: {
  shoppingListId: number;
  productId?: number;
  name?: string;
  price?: number;
  quantity?: number;
  notes?: string;
}) {
  const shoppingListItem = await prisma.shoppingListItem.create({
    data: {
      shoppingListId: item.shoppingListId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      notes: item.notes,
    },
  });

  return shoppingListItem;
}

/**
 * Edits an existing shopping list item.
 */
export async function editShoppingListItem(item: {
  id: number;
  productId?: number | null;
  name?: string | null;
  price?: number | null;
  quantity?: number;
  notes?: string | null;
}) {
  await prisma.shoppingListItem.update({
    where: { id: item.id },
    data: {
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
    },
  });
}

/**
 * Deletes a shopping list item by id.
 */
export async function deleteShoppingListItem(id: number) {
  await prisma.shoppingListItem.delete({
    where: { id },
  });
}

/**
 * Creates a new product.
 */
export async function createProduct(product: {
  name: string;
  type?: string;
  price?: number;
}) {
  const newProduct = await prisma.product.create({
    data: {
      name: product.name,
      type: product.type,
      price: product.price,
    },
  });

  return newProduct;
}

/**
 * Edits an existing product
 */
export async function editProduct(product: {
  id: number;
  name: string;
  type?: string | null;
  price?: number | null;
}) {
  await prisma.product.update({
    where: { id: product.id },
    data: {
      name: product.name,
      type: product.type,
      price: product.price,
    },
  });
}

/**
 * Deletes a product by id.
 */
export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: { id },
  });
}
