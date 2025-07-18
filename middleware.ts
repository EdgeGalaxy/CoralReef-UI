// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (!req.auth) {
    const url = req.url.replace(path, '/signin');
    return Response.redirect(url);
  }
});

export const config = { matcher: ['/dashboard/:path*'] };
