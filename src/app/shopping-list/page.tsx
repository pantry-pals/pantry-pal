import { getServerSession } from 'next-auth';
import { Container, Row, Col } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import ShoppingListTable from '@/components/ShoppingListTable';

type SessionUser = { id: string; email: string; randomKey: string };

const ShoppingListPage = async () => {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  loggedInProtectedPage(session);

  const owner = session?.user?.email || '';

  // grab list + items for this user
  const list = await prisma.shoppingList.findFirst({
    where: { owner },
    include: {
      items: {
        include: {
          produce: true, // bring in name/unit
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const items = list?.items ?? [];

  return (
    <main>
      <Container id="shopping-list" className="py-3">
        <Row>
          <Col>
            <h1>Shopping List</h1>
            <ShoppingListTable items={items} />
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ShoppingListPage;
