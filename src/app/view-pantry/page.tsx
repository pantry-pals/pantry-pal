// src/app/producelist/page.tsx
import { getServerSession } from 'next-auth';
import { Container, Row, Col } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import ProduceListWithGrouping from '@/components/SearchBar'; // client component

type SessionUser = { id: string; email: string; randomKey: string };

const ViewPantryPage = async () => {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  loggedInProtectedPage(session);

  const userId = session?.user?.id;

  if (!userId) {
    return <div>User not found</div>;
  }

  const produce = await prisma.produce.findMany({
    where: {
      userId: parseInt(userId, 10),
    },
    orderBy: {
      product: {
        name: 'asc',
      },
    },
    include: {
      product: true,
    },
  });

  return (
    <main>
      <Container id="list" className="py-3">
        <Row>
          <Col>
            <h1>Your Pantry at a Glance</h1>
            <ProduceListWithGrouping initialProduce={produce} />
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ViewPantryPage;
