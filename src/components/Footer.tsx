import { Container, Row, Col } from "react-bootstrap";
import { Facebook, Twitter, Linkedin, Instagram, GeoAlt, Envelope, Telephone } from "react-bootstrap-icons";

const Footer = () => (
  <footer className="bg-light text-dark mt-auto">
    <div className="py-5 border-top border-bottom">
      <Container>
        {/* Center the row horizontally */}
        <Row className="justify-content-center text-start">
          {/* Company Info */}
          <Col md={3} className="mb-4 mb-md-0">
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#ddd",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            ></div>
            <h6 className="fw-bold">Pantry Pals</h6>
            <p className="small text-muted">
              Pantry Pals helps you keep track of what’s in your kitchen.
              From your pantry to your fridge, you’ll always know what you
              have on hand, discover recipes you can make, and easily manage
              your shopping list.
            </p>
          </Col>

          {/* Browse */}
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="fw-bold">Browse</h6>
            <ul className="list-unstyled small">
              <li><a href="#">Home</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </Col>

          {/* Services */}
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="fw-bold">Services</h6>
            <ul className="list-unstyled small">
              <li><a href="#">Pantry</a></li>
              <li><a href="#">Fridge</a></li>
              <li><a href="#">Recipe</a></li>
              <li><a href="#">Inventory</a></li>
              <li><a href="#">Shopping List</a></li>
            </ul>
          </Col>

          {/* Contact */}
          <Col md={3}>
            <h6 className="fw-bold">Contact</h6>
            <ul className="list-unstyled small">
              <li className="d-flex align-items-center mb-2">
                <GeoAlt className="me-2" /> 2500 Campus Rd, Honolulu, HI 96822
              </li>
              <li className="d-flex align-items-center mb-2">
                <Envelope className="me-2" /> PantryPals@gmail.com
              </li>
              <li className="d-flex align-items-center mb-2">
                <Telephone className="me-2" /> 808-XXX-XXXX
              </li>
            </ul>
            <div className="d-flex gap-2 mt-2">
              <a href="#" style={{ fontSize: "1.5rem" }}><Facebook /></a>
              <a href="#" style={{ fontSize: "1.5rem" }}><Twitter /></a>
              <a href="#" style={{ fontSize: "1.5rem" }}><Linkedin /></a>
              <a href="#" style={{ fontSize: "1.5rem" }}><Instagram /></a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>

    {/* Copyright Bar */}
    <div className="bg-light py-3">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} className="d-flex justify-content-between small text-muted">
            <span>&copy; {new Date().getFullYear()} Pantry Pals</span>
            <a href="#">Privacy Policy</a>
          </Col>
        </Row>
      </Container>
    </div>
  </footer>
);

export default Footer;
