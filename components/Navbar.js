"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <div className="navbar">
      <Link href="/" className="brand">
        Ciné<em>List</em>
      </Link>
      {session && (
        <div className="nav-links">
          <span>{session.user.name}</span>
          <Link href="/titles/new">Ajouter</Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })}>Déconnexion</button>
        </div>
      )}
    </div>
  );
}
