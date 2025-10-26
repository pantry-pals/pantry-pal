// src/app/producelist/page.tsx
import { getServerSession } from 'next-auth';
import { Container } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import PantryClient from '@/components/produce/PantryClient';

type SessionUser = { id: string; email: string; randomKey: string };

const ViewPantryPage = async () => {
  // @ts-ignore
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
        <PantryClient initialProduce={produce} owner={owner} />
      </Container>
    </main>
  );
};

export default ViewPantryPage;
