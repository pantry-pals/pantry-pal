import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // get session without authOptions (route handlers infer it automatically)
    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const recipeId = Number(params.id);
    if (Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe id' },
        { status: 400 },
      );
    }

    const recipeRecord = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { owner: true },
    });

    if (!recipeRecord) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 },
      );
    }

    const ownerField = recipeRecord.owner;

    // Normalize owner to array
    let owners: string[] = [];
    if (Array.isArray(ownerField)) {
      owners = ownerField;
    } else if (typeof ownerField === 'string') {
      owners = [ownerField];
    }

    const isAdmin = email === 'admin@foo.com';
    const isOwner = owners.includes(email);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 },
      );
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json(
      { message: 'Recipe deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 },
    );
  }
}
