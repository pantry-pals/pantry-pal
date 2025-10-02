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
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Navbar className="navandfooter" expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/" className={pathname === '/' ? 'active' : undefined}>
          Pantry Pals
        </Navbar.Brand>

        {session && (
        <>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto justify-content-start">
              <Nav.Link as={Link} id="add-stuff-nav" href="/add" active={isActive('/add')}>
                Add Stuff
              </Nav.Link>
              <Nav.Link as={Link} id="view-pantry-nav" href="/view-pantry" active={isActive('/view-pantry')}>
                View Pantry
              </Nav.Link>
              <Nav.Link as={Link} id="shopping-list-nav" href="/shopping-list" active={isActive('/shopping-list')}>
                Shopping List
              </Nav.Link>

              {role === 'ADMIN' && (
              <Nav.Link as={Link} id="admin-stuff-nav" href="/admin" active={isActive('/admin')}>
                Admin
              </Nav.Link>
              )}
            </Nav>

            <Nav>
              <NavDropdown id="login-dropdown" title={currentUser ?? ''}>
                <NavDropdown.Item as={Link} id="login-dropdown-sign-out" href="/auth/signout">
                  <BoxArrowRight />
                  <span className="ms-2">Sign Out</span>
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} id="login-dropdown-change-password" href="/auth/change-password">
                  <Lock />
                  <span className="ms-2">Change Password</span>
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </>
        )}
      </Container>
    </Navbar>

  );
};

export default NavBar;
