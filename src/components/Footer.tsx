import { Container, Row, Col, Image } from 'react-bootstrap';
import { GeoAlt, Envelope, Github } from 'react-bootstrap-icons';

const Footer = () => {
  // We build the copyright string in a variable to avoid JSX formatting errors.
  const copyrightText = `© ${new Date().getFullYear()} Pantry Pals. All Rights Reserved.`;

  return (
    <footer className="navandfooter mt-auto">
      <Container>
        <Row className="justify-content-center text-start">

          {/* Company Info */}
          <Col md={4} lg={3} className="mb-4 mb-md-0">
            <div className="d-flex align-items-center mb-2">

              <div className="p-1 me-4 rounded" style={{ backgroundColor: 'var(--timberwolf)' }}>
                <Image
                  src="/pantrypals-logo.png"
                  alt="Pantry Pals Logo"
                  width="50"
                  height="50"
                />
              </div>

              <h5 className="fw-bold mb-0">Pantry Pals</h5>
            </div>
            <p className="footer-text-muted small">
              Keep track of your pantry, cut down on food waste, and discover recipes with
              what you already have. Smarter cooking, simplified.
            </p>
          </Col>

          {/* Browse Links */}
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="fw-bold">Browse</h6>
            <ul className="list-unstyled small footer-links">
              <li className="mb-1"><a href="/">Home</a></li>
              <li className="mb-1"><a href="/aboutus">About Us</a></li>
              <li className="mb-1"><a href="/dashboard">Dashboard</a></li>
            </ul>
          </Col>

          {/* Features */}
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="fw-bold">Features</h6>
            <ul className="list-unstyled small footer-links">
              <li className="mb-1"><a href="/view-pantry">My Pantry</a></li>
              <li className="mb-1"><a href="/shopping-list">Shopping List</a></li>
              <li className="mb-1"><a href="/recipes">Recipes</a></li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col md={4} lg={3}>
            <h6 className="fw-bold">Contact</h6>
            <ul className="list-unstyled small footer-text-muted">
              <li className="d-flex align-items-center mb-2">
                <GeoAlt className="me-2 flex-shrink-0" />
                {' '}
                2500 Campus Rd, Honolulu, HI 96822
              </li>
              <li className="d-flex align-items-center mb-2">
                <Envelope className="me-2 flex-shrink-0" />
                {' '}
                pantrypal808@gmail.com
              </li>
              <li className="d-flex align-items-center">
                <a
                  href="https://github.com/pantry-pals"
                  className="d-inline-flex align-items-center"
                >
                  <Github className="me-2" />
                  View on GitHub
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>

      {/* Copyright Bar */}
      <div className="footer-bottom-bar">
        <Container>
          <Row>
            <Col className="text-center small">
              {copyrightText}
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
