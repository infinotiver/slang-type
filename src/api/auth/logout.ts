interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => ApiResponse;
  setHeader: (name: string, value: string) => void;
}

export default async function logoutHandler(_req: unknown, res: ApiResponse) {
  res.setHeader(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
  );
  return res.status(200).json({ ok: true });
}
