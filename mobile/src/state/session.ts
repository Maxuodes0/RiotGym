import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "gym_tracker_session";

export type Session = {
  token: string;
  userId: string;
  name: string;
  email: string;
};

let session: Session | null = null;

export async function setSession(input: { token: string; user: { id: string; name: string; email: string } }) {
  session = {
    token: input.token,
    userId: input.user.id,
    name: input.user.name,
    email: input.user.email
  };
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadStoredSession() {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  session = JSON.parse(raw) as Session;
  return session;
}

export async function clearSession() {
  session = null;
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function getAuthToken() {
  return session?.token ?? null;
}

export function getSessionName() {
  return session?.name ?? "المستخدم";
}
