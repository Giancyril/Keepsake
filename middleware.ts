export { auth as middleware } from "@/lib/auth/config";

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - api/auth routes (NextAuth.js handlers)
     * - share/[token] routes (public share pages — no auth required)
     * - _next/static, _next/image (Next.js internals)
     * - favicon, public files
     */
    "/((?!api/auth|share|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
