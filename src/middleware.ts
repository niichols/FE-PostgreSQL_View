export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/libros/:path*", "/clientes/:path*", "/equpos/:path*"  ],
};
