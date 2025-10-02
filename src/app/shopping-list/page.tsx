// src/app/producelist/page.tsx
import { getServerSession } from 'next-auth';
import { Container, Row, Col } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';

type SessionUser = { id: string; email: string; randomKey: string };

const ShoppingListPage = async () => {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  loggedInProtectedPage(session);

  const owner = session?.user?.email || '';

  const produce = await prisma.produce.findMany({
    where: { owner },
    orderBy: [{ name: 'asc' }],
  });

  return (
    <main>
      <Container id="view-pantry" className="py-3">
        <Row>
          <Col>
            <h1>Shopping List</h1>
            <p>Page is currently being implemented.</p>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ShoppingListPage;
