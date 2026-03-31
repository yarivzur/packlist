import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public paths
  const publicPaths = ["/", "/login", "/api/auth", "/api/webhooks", "/api/cron"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  const hasBearer = req.headers.get("authorization")?.startsWith("Bearer ");
  if (!isLoggedIn && !isPublic && !hasBearer) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
