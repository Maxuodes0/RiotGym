let session: { token: string; userId: string; name: string; email: string } | null = null;

export function setSession(input: { token: string; user: { id: string; name: string; email: string } }) {
  session = {
    token: input.token,
    userId: input.user.id,
    name: input.user.name,
    email: input.user.email
  };
}

export function getSessionUserId() {
  return session?.userId ?? null;
}

export function getSessionName() {
  return session?.name ?? "المستخدم";
}
