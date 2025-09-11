import { Col, Container, Row } from 'react-bootstrap';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
const Footer = () => (
  <footer className="mt-auto py-3 navandfooter">
    <Container>
      <Row>
        <Col className="text-start">
          Department of Information and Computer Sciences
          <br />
          University of Hawaii
          <br />
          Honolulu, HI 96822
          <br />
          <a href="http://ics-software-engineering.github.io/nextjs-application-template">Template Home Page</a>
        </Col>
        <Col className="text-end">
          <a href="/aboutus">About Us</a>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
