import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
const privatePaths = ["/", "/documents"];
const adminPaths = ["/documents"];
const authPaths = ["/login", "/register"];

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("access_token")?.value;
  const user: any = sessionToken ? jwtDecode(sessionToken || "") : "";
  const role = user.role || "";
  // Chưa đăng nhập thì không cho vào private paths
  if (
    privatePaths.some((path) => pathname.startsWith(path)) &&
    !sessionToken &&
    pathname !== "/login"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Giới hạn role
  if (adminPaths.some((path) => pathname.startsWith(path)) && role != "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // Đăng nhập rồi thì không cho vào login/register nữa
  if (authPaths.some((path) => pathname.startsWith(path)) && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/login", "/register", "/documents"],
};
