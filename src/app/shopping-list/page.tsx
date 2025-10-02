import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { Container, Row, Col } from 'react-bootstrap';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import ShoppingListTable from '@/components/ShoppingListTable';
import RecommendedStuff from '@/components/RecommendedStuff';
import { addShoppingListItem } from '@/lib/dbActions';

type SessionUser = { id: string; email: string; randomKey: string };

export default async function ShoppingListPage() {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  const owner = session?.user?.email || '';

  // 1) Load the user's list + items
  const list = await prisma.shoppingList.findFirst({
    where: { owner },
    include: { items: { include: { produce: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const items = list?.items ?? [];
  const hasListItems = items.length > 0;

  // 2) Build recommendations (always an array)
  const lowQtyThreshold = 1;
  const expiringWithinDays = 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + expiringWithinDays);

  const recs = await prisma.produce.findMany({
    where: {
      owner,
      OR: [{ quantity: { lte: lowQtyThreshold } }, { expiration: { lte: cutoff } }],
    },
    orderBy: [{ expiration: 'asc' }, { name: 'asc' }],
    take: 20,
  });

  const recommendedItems = recs.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit ?? '',
    quantity: Number(p.quantity ?? 0),
    expiration: p.expiration ?? null,
  }));
  const hasRecs = recommendedItems.length > 0;

  // 3) Server action for the "Add" buttons in RecommendedStuff
  async function addOne(produceId: number) {
    'use server';

    if (!list?.id) return;
    await addShoppingListItem({
      shoppingListId: list.id,
      produceId,
      quantity: 1,
      price: null,
    });
    revalidatePath('/ShoppingList');
  }

  // Decide the main column width: full width when no sidebar, otherwise 8/12
  const mainCol = hasListItems && hasRecs ? 8 : 12;

  return (
    <main>
      <Container id="shopping-list" className="py-3">
        <Row className="g-4">
          <h1>Shopping List</h1>
        </Row>
        <Row className="g-4">
          {/* Main content (list table or empty state) */}
          <Col lg={mainCol}>

            <ShoppingListTable items={items as any} />
          </Col>

          {/* Right sidebar: only render when the list has items AND we have recommendations */}
          {hasListItems && hasRecs && (
            <Col lg={4}>
              {/* optional: keep it visible on scroll */}
              <div className="position-sticky" style={{ top: '1rem' }}>
                <RecommendedStuff
                  items={recommendedItems}
                  canAdd={!!list?.id}
                  onAdd={addOne}
                  lowQtyThreshold={lowQtyThreshold}
                  expiringWithinDays={expiringWithinDays}
                />
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </main>
  );
}
