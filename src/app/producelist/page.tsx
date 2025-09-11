import { getServerSession } from 'next-auth';
import { Col, Container, Row, Table } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import ProduceItem from '@/components/ProduceItem';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';

type SessionUser = {
  id: string;
  email: string;
  randomKey: string;
};

const ProduceListPage = async () => {
  const session = (await getServerSession(authOptions)) as
    | { user: SessionUser }
    | null;

  loggedInProtectedPage(session);

  const owner = session?.user?.email || '';

  const produce = await prisma.produce.findMany({
    where: { owner },
  });

  return (
    <main>
      <Container id="list" className="py-3">
        <Row>
          <Col>
            <h1>Your Pantry at a Glance</h1>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Expiration</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {produce.map((item) => (
                  <ProduceItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    quantity={item.quantity}
                    type={item.type}
                    location={item.location}
                    expiration={item.expiration}
                    owner={item.owner}
                  />
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ProduceListPage;
