export interface JwtUserPayload {
  sub: string;
  username: string;
  role: 'ADMIN' | 'CLIENT';
}
