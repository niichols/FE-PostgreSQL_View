"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container d-flex justify-content-between">
        {/* Botón de Inicio alineado a la izquierda */}
        <Link href="/" className="btn btn-primary btn-sm">
          Inicio
        </Link>

        {/* Botones alineados a la derecha */}
        <div>
          {session?.user ? (
            <>
              {/* <Link href="/libros" className="btn btn-primary btn-sm me-2">
                Libros
              </Link>
              <Link href="/equipos" className="btn btn-primary btn-sm me-2">
                Equipos
              </Link> */}
              <Link href="/clientes" className="btn btn-primary btn-sm me-2">
                Estudiantes
              </Link>
              {/* <Link href="/reservas" className="btn btn-primary btn-sm me-2">
                Reservas
              </Link> */}
              <button onClick={() => signOut()} className="btn btn-danger btn-sm">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary btn-sm me-2">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

