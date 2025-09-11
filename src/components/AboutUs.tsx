import { Container, Image, Row, Col } from 'react-bootstrap';

export async function AboutUs() {
  return (
    <Container className="my-3">
      <Row className="align-items-center">
        <Col md={4} className="align-items-center">
          <Image
            src="/pantrypalslogo.png"
            alt="Pantry Pals Logo"
            width={400}
            height={400}
            className="float-start rounded-lg me-5 mb-2"
          />
        </Col>
        <Col md={8}>
          <h1>About Pantry Pal</h1>
          <p>
            Pantry Pal is an application designed to help users keep track of the food items they already have at home.
            With Pantry Pal you can:
          </p>
          <ul>
            <li>Track your pantry items - log what you have, how much you have, and when it expires</li>
            <li>
              Stay organized - see at a glance what&apos;s running low, so you&apos;re not caught off guard when cooking
            </li>
            <li>Get recipe ideas - use the items you already have at home to find inspiration for meals</li>
            <li>Build a shopping list - easily add items to a list as things are running low or out of stock</li>
          </ul>
          <h1>Why We Built It</h1>
          <p>
            Our team created Pantry Pal to address the common problem of food waste and disorganization in the
            kitchen. We wanted to build a tool that would help people make the most of the food they have, reduce waste,
            and save money by avoiding unnecessary purchases.
          </p>
          <h1>Looking Ahead</h1>
          <p>
            We&apos;re excited about the future of Pantry Pal and have plans to add even more features to make it an
            indispensable tool for home cooks. Some of the features we&apos;re considering include:
          </p>
          <ul>
            <li>Barcode scanning for easy item entry</li>
            <li>Recipe suggestions based on dietary restrictions</li>
            <li>Integration with grocery delivery services</li>
            <li>Sharing pantry lists with family members or roommates</li>
            <li>Notifications when an item is about to expire</li>
          </ul>
          <p>
            We&apos;re committed to continuously improving Pantry Pal and making it the best it can be for our users.
          </p>
          <h1>Get Involved</h1>
          <p>
            We&apos;d love to hear from you! If you have feedback, feature requests, or just want to say hello, please
            don&apos;t hesitate to reach out.
          </p>
        </Col>
      </Row>
    </Container>
  );
}
