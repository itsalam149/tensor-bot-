import { getCurrentUser } from "@/lib/auth/session";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const user = await getCurrentUser();

  return <NavbarClient user={user as any} />;
}
