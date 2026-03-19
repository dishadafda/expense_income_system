import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/incomes/:path*",
    "/categories/:path*",
    "/sub-categories/:path*",
    "/projects/:path*",
    "/people/:path*",
  ],
};

