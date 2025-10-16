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

/**
 * Adds a new produce.
 */
export async function addProduce(produce: {
  name: string;
  type: string;
  location: string;
  storage: string;
  quantity: number;
  unit: string;
  expiration: string | Date | null;
  owner: string;
  image: string | null;
  restockThreshold?: number;
}) {
  const newProduce = await prisma.produce.upsert({
    where: { name_owner: { name: produce.name, owner: produce.owner } },
    update: {
      name: produce.name,
      type: produce.type,
      owner: produce.owner,
      location: produce.location,
      storage: produce.location, // Initially set storage to location
      quantity: produce.quantity,
      unit: produce.unit,
      expiration: produce.expiration ? new Date(produce.expiration) : null,
      image: produce.image ? produce.image : null,
      restockThreshold: produce.restockThreshold ?? 0,
    },
    create: {
      name: produce.name,
      type: produce.type,
      owner: produce.owner,
      location: produce.location,
      storage: produce.storage, // Initially set storage to location
      quantity: produce.quantity,
      unit: produce.unit,
      expiration: produce.expiration ? new Date(produce.expiration) : null,
      image: produce.image ? produce.image : null,
      restockThreshold: produce.restockThreshold ?? 0,
    },
  });

  // AUTO-ADD to shopping list if below threshold
  if (newProduce.restockThreshold !== null && newProduce.quantity <= newProduce.restockThreshold) {
    const shoppingList = await prisma.shoppingList.upsert({
      where: { name_owner: { name: 'Auto Restock', owner: newProduce.owner } },
      update: {},
      create: {
        name: 'Auto Restock',
        owner: newProduce.owner,
      },
    });

    const existingItem = await prisma.shoppingListItem.findFirst({
      where: {
        shoppingListId: shoppingList.id,
        produceId: newProduce.id,
      },
    });

    if (!existingItem) {
      await prisma.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          produceId: newProduce.id,
          quantity: newProduce.restockThreshold, // or default quantity
        },
      });
    }
  }

  redirect('/view-pantry');
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

  const updatedProduce = await prisma.produce.update({
    where: { id: produce.id },
    data: {
      name: produce.name,
      type: produce.type,
      location: produce.location,
      storage: produce.storage,
      quantity: produce.quantity,
      unit: produce.unit,
      expiration,
      owner: produce.owner,
      image: produce.image,
      restockThreshold: produce.restockThreshold ?? 0,
    },
  });

  // Auto-add to shopping list if below threshold
  if (updatedProduce.restockThreshold !== null && updatedProduce.quantity <= updatedProduce.restockThreshold) {
    const shoppingList = await prisma.shoppingList.upsert({
      where: { name_owner: { name: 'Auto Restock', owner: updatedProduce.owner } },
      update: {},
      create: {
        name: 'Auto Restock',
        owner: updatedProduce.owner,
      },
    });

    const existingItem = await prisma.shoppingListItem.findFirst({
      where: {
        shoppingListId: shoppingList.id,
        produceId: updatedProduce.id,
      },
    });

    if (!existingItem) {
      await prisma.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          produceId: updatedProduce.id,
          quantity: updatedProduce.restockThreshold,
        },
      });
    }
  }

  return updatedProduce;
}

/**
 * Deletes a produce by id.
 */
export async function deleteProduce(id: number) {
  await prisma.produce.delete({
    where: { id },
  });

  redirect('/view-pantry');
}

export async function getUserProduceByEmail(owner: string) {
  return prisma.produce.findMany({
    where: { owner },
    select: { name: true },
  });
}

/**
 * Adds a new shopping list.
 */
export async function addShoppingList(list: { name: string; owner: string }) {
  const shoppingList = await prisma.shoppingList.create({
    data: {
      name: list.name,
      owner: list.owner,
    },
  });

  redirect('/shopping-list');
  return shoppingList;
}

/**
 * Edits an existing shopping list.
 */
export async function editShoppingList(list: Prisma.ShoppingListUpdateInput & { id: number }) {
  const updatedList = await prisma.shoppingList.update({
    where: { id: list.id },
    data: {
      name: list.name,
      owner: list.owner,
    },
  });

  return updatedList;
}

/**
 * Deletes a shopping list and its items.
 */
export async function deleteShoppingList(id: number) {
  // delete items first to maintain relational integrity
  await prisma.shoppingListItem.deleteMany({
    where: { shoppingListId: id },
  });

  await prisma.shoppingList.delete({
    where: { id },
  });

  redirect('/shopping-list');
}

/**
 * Adds a new item to a shopping list.
 */
export async function addShoppingListItem(item: {
  shoppingListId: number;
  produceId: number;
  quantity: number;
  price?: number;
}) {
  const newItem = await prisma.shoppingListItem.create({
    data: {
      shoppingListId: item.shoppingListId,
      produceId: item.produceId,
      quantity: item.quantity,
      price: item.price !== undefined ? new Prisma.Decimal(item.price) : undefined,
    },
  });

  return newItem;
}

/**
 * Edits a shopping list item.
 */
export async function editShoppingListItem(item: Prisma.ShoppingListItemUpdateInput & { id: number }) {
  const updatedItem = await prisma.shoppingListItem.update({
    where: { id: item.id },
    data: {
      quantity: item.quantity,
      price: item.price,
    },
  });

  return updatedItem;
}

/**
 * Deletes a shopping list item.
 */
export async function deleteShoppingListItem(id: number) {
  await prisma.shoppingListItem.delete({
    where: { id },
  });
}
