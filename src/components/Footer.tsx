import { Col, Container, Row } from 'react-bootstrap';

const Footer = () => (
  <footer className="mt-auto py-3 navandfooter">
    <Container>
      <Row>
        <Col className="text-start">
          <strong>Pantry Pal</strong>
          {' '}
          &mdash; Your personal pantry manager
          <br />
          <a
            href="https://github.com/pantry-pals"
            style={{ color: 'var(--timberwolf)', textDecoration: 'underline' }}
          >
            View on GitHub
          </a>
        </Col>
        <Col className="text-end">
          <a
            href="/aboutus"
            style={{ color: 'var(--timberwolf)', textDecoration: 'underline' }}
          >
            About Us
          </a>
          <br />
          &copy;
          {' '}
          {new Date().getFullYear()}
          {' '}
          Pantry Pal Team
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
