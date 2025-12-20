
import { Button, Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { useNavigate,Link } from 'react-router-dom';
import { ProtectedButton } from "./ProtectedButton";

export function UserNav() {
  const navigate = useNavigate();

  const id = localStorage.getItem('id');

  return (
    <Navbar fluid rounded>
      <NavbarBrand onClick={() => navigate('/')}>
        <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
      </NavbarBrand>
      <div className="flex md:order-2">
        <Button>Get started</Button>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink href="#" active>
          Home
        </NavbarLink>
        <NavbarLink href="/login/user">login</NavbarLink>
        <NavbarLink href="/register/user">register</NavbarLink>
       <ProtectedButton roles={['barber','barber_admin']}><Link to = {`${id}/reservations`}> <NavbarLink>reservations</NavbarLink></Link></ProtectedButton>
        <ProtectedButton roles={['barber_admin']}><Link to = {`/staff/details/:shopId`}> <NavbarLink>staff</NavbarLink></Link></ProtectedButton>
      </NavbarCollapse>
    </Navbar>
  );
}
