'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, Lock } from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey: string };
  const role = userWithRole?.randomKey;
  const pathname = usePathname();

  // helper for active state (also matches subpaths like /add/123)
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <Navbar className="navandfooter" expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/">Pantry Pals</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start">
            {currentUser ? (
              <>
                <Nav.Link as={Link} id="add-stuff-nav" href="/add" active={isActive('/add')}>
                  Add Stuff
                </Nav.Link>
                <Nav.Link as={Link} id="list-stuff-nav" href="/list" active={isActive('/list')}>
                  List Stuff
                </Nav.Link>
                <Nav.Link as={Link} id="view-pantry-nav" href="/view-pantry" active={isActive('/view-pantry')}>
                  View Pantry
                </Nav.Link>
              </>
            ) : null}

            {currentUser && role === 'ADMIN' ? (
              <Nav.Link as={Link} id="admin-stuff-nav" href="/admin" active={isActive('/admin')}>
                Admin
              </Nav.Link>
            ) : null}
          </Nav>

          <Nav>
            {session ? (
              <NavDropdown id="login-dropdown" title={currentUser ?? ''}>
                <NavDropdown.Item as={Link} id="login-dropdown-sign-out" href="/auth/signout">
                  <BoxArrowRight /> Sign Out
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} id="login-dropdown-change-password" href="/auth/change-password">
                  <Lock /> Change Password
                </NavDropdown.Item>
              </NavDropdown>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
