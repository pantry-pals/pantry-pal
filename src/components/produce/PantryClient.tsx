'use client';

import { Button, Col, Container, Row, Nav } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import AddProduceModal from './AddProduceModal';
import ProduceListWithGrouping from './ProduceListWithGrouping';
import '../../styles/buttons.css';

function PantryClient({ initialProduce, owner }: { initialProduce: any[]; owner: string }) {
  const [showModal, setShowModal] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string>('all');

  // Derive unique locations (sorted)
  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const item of initialProduce) {
      const locName = typeof item.location === 'object' ? item.location?.name : item.location;
      if (locName) set.add(locName.trim().toLowerCase());
    }
    return Array.from(set).sort();
  }, [initialProduce]);

  // Filter produce based on selected location
  const filteredProduce = useMemo(() => {
    if (activeLocation === 'all') return initialProduce;
    return initialProduce.filter((p) => {
      const locName = typeof p.location === 'object' ? p.location?.name : p.location;
      return locName?.trim().toLowerCase() === activeLocation;
    });
  }, [initialProduce, activeLocation]);

  return (
    <main>
      <Container id="view-pantry" className="py-3">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h1>Your Pantry at a Glance</h1>
            <Button className="btn-add" onClick={() => setShowModal(true)}>
              + Add Item
            </Button>
          </Col>
        </Row>

        {/* House Tabs */}
        <Row className="mb-4">
          <Col>
            <Nav
              variant="tabs"
              activeKey={activeLocation}
              onSelect={(selectedKey) => setActiveLocation(selectedKey || 'all')}
              className="justify-content-center pantry-controls"
            >
              <Nav.Item>
                <Nav.Link eventKey="all">All Locations</Nav.Link>
              </Nav.Item>
              {locations.map((loc) => (
                <Nav.Item key={loc}>
                  <Nav.Link
                    eventKey={loc}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {loc}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>
        </Row>

        {/* Produce list */}
        <Row>
          <Col>
            <ProduceListWithGrouping initialProduce={filteredProduce} />
          </Col>
        </Row>
      </Container>

      {/* Modal */}
      <AddProduceModal
        show={showModal}
        onHide={() => setShowModal(false)}
        produce={{
          id: 0,
          name: '',
          type: '',
          location: '',
          storage: '',
          quantity: 0,
          unit: 'kg',
          expiration: null,
          image: null,
          owner,
          restockThreshold: 0,
        }}
      />
    </main>
  );
}

export default PantryClient;
