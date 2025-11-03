'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { Clock, Search, Cart, ExclamationTriangle } from 'react-bootstrap-icons';
import Link from 'next/link';

type QuickAlertsProps = {
  ownerEmail: string;
  recipes: any[];
  produce: any[];
};

export default function QuickAlerts({ ownerEmail, recipes, produce }: QuickAlertsProps) {
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [shoppingLists, setShoppingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerEmail) return;

    const fetchAlerts = async () => {
      try {
        setLoading(true);

        // Expiring items
        const expiringRes = await fetch(`/api/expiring?owner=${encodeURIComponent(ownerEmail)}`);
        if (expiringRes.ok) {
          const data = await expiringRes.json();
          setExpiringItems(data.expiringItems || []);
        }

        // Shopping lists
        const shoppingRes = await fetch(`/api/shopping-lists?owner=${encodeURIComponent(ownerEmail)}`);
        if (shoppingRes.ok) {
          const data = await shoppingRes.json();
          setShoppingLists(data.shoppingLists || []);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(interval);
    };
  }, [ownerEmail]);

  // Compute pantry and recipe availability (same as RecipesClient)
  const pantryNames = useMemo(() => new Set(produce.map((p) => p.name.toLowerCase())), [produce]);

  const availableRecipes = useMemo(() => recipes.filter((r) => {
    const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
    if (ingredients.length === 0) return false;
    return ingredients.every((ing: string) => pantryNames.has(ing.toLowerCase()));
  }), [recipes, pantryNames]);

  const recipeCount = availableRecipes.length;

  const getNextShoppingDate = () => {
    if (shoppingLists.length === 0) return null;
    const sorted = [...shoppingLists].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastShopping = new Date(sorted[0].createdAt);
    const nextShopping = new Date(lastShopping);
    nextShopping.setDate(nextShopping.getDate() + 7);
    const today = new Date();
    const diffDays = Math.ceil((nextShopping.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Tomorrow';
    if (diffDays <= 0) return 'Today';
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm border-light">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <ExclamationTriangle className="me-2 text-warning" size={20} />
            <Card.Title className="mb-0">Quick Alerts</Card.Title>
          </div>
          <div className="text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading alerts...
          </div>
        </Card.Body>
      </Card>
    );
  }

  const nextShoppingDate = getNextShoppingDate();

  return (
    <Card className="mb-4 shadow-sm border-light">
      <Card.Body>
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <ExclamationTriangle className="me-2 text-warning" size={20} />
          <Card.Title className="mb-0">Quick Alerts</Card.Title>
        </div>

        {/* Alerts Grid */}
        <Row xs={1} md={3} className="g-4">
          {/* Expiring Soon */}
          <Col>
            <Link href="/view-pantry" className="text-success text-decoration-none fw-semibold">
              <Card className="h-100 border-start border-4 border-warning shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <Clock className="me-2 text-secondary" />
                      <Card.Subtitle className="fw-semibold text-dark">Expiring Soon</Card.Subtitle>
                    </div>
                    <Badge bg="warning" text="dark">
                      {expiringItems.length}
                      {expiringItems.length === 1 ? ' item' : ' items'}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted small mb-0">
                    {(() => {
                      const count = expiringItems.length;
                      if (count === 0) return 'No items expiring soon';
                      if (count === 1) return `${expiringItems[0].name} expires soon`;
                      return `${expiringItems[0].name} and ${count - 1} other ${count === 2 ? 'item' : 'items'}`;
                    })()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Recipes Available */}
          <Col>
            <Card className="h-100 border-start border-4 border-success shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <Search className="me-2 text-secondary" />
                    <Card.Subtitle className="fw-semibold text-dark">Recipes Available</Card.Subtitle>
                  </div>
                  <Badge bg="success">
                    {recipeCount}
                    {' '}
                    new
                  </Badge>
                </div>

                <Card.Text className="text-muted small mb-0">
                  {(() => {
                    if (recipeCount === 0) {
                      return 'No recipes available with current pantry';
                    }
                    if (recipeCount === 1) {
                      return (
                        <>
                          You can make
                          {' '}
                          <Link
                            href={`/recipes/${availableRecipes[0].id}`}
                            className="text-success text-decoration-none fw-semibold"
                          >
                            {availableRecipes[0].title}
                          </Link>
                        </>
                      );
                    }
                    if (recipeCount === 2) {
                      return (
                        <>
                          You can make
                          {' '}
                          <Link
                            href={`/recipes/${availableRecipes[0].id}`}
                            className="text-success text-decoration-none fw-semibold"
                          >
                            {availableRecipes[0].title}
                          </Link>
                          {' '}
                          and
                          {' '}
                          <Link
                            href={`/recipes/${availableRecipes[1].id}`}
                            className="text-success text-decoration-none fw-semibold"
                          >
                            {availableRecipes[1].title}
                          </Link>
                        </>
                      );
                    }
                    return (
                      <>
                        You can make
                        {' '}
                        <Link
                          href={`/recipes/${availableRecipes[0].id}`}
                          className="text-success text-decoration-none fw-semibold"
                        >
                          {availableRecipes[0].title}
                        </Link>
                        ,
                        {' '}
                        <Link
                          href={`/recipes/${availableRecipes[1].id}`}
                          className="text-success text-decoration-none fw-semibold"
                        >
                          {availableRecipes[1].title}
                        </Link>
                        , and more
                      </>
                    );
                  })()}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Shopping List Due */}
          <Col>
            <Card className="h-100 border-start border-4 border-info shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <Cart className="me-2 text-secondary" />
                    <Card.Subtitle className="fw-semibold text-dark">Shopping List Due</Card.Subtitle>
                  </div>
                  <Badge bg="info" text="dark">
                    {nextShoppingDate || 'N/A'}
                  </Badge>
                </div>
                <Card.Text className="text-muted small mb-0">
                  {(() => {
                    if (!nextShoppingDate) {
                      return 'No shopping lists due yet';
                    }

                    if (nextShoppingDate === 'Tomorrow' || nextShoppingDate === 'Today') {
                      return `Weekly grocery trip scheduled for ${nextShoppingDate.toLowerCase()}`;
                    }

                    return `Next shopping trip in ${nextShoppingDate}`;
                  })()}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
