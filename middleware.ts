export { default } from "next-auth/middleware";

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

