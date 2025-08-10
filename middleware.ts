import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith("/api/uploadthing")) {
          return true;
        }
        if (req.nextUrl.pathname.startsWith("/sign-in") || 
            req.nextUrl.pathname.startsWith("/sign-up")) {
          return true;
        }
        // Require authentication for all other routes
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
};
