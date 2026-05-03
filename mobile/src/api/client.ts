import { clearSession, getAuthToken } from "../state/session";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export type OnboardingInput = {
  gender: "male" | "female";
  age: number;
  heightCm: number;
  currentWeightKg: number;
  bodyFatPercent?: number | null;
  goal: "lose" | "maintain" | "gain";
  targetWeightKg: number;
  weeklyChangeKg: number;
  deadline?: string | null;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  workoutDaysPerWeek: number;
  equipment: "gym" | "home" | "none";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  limitations?: string | null;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export async function login(email: string, password: string) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    auth: false
  });
}

export async function register(payload: { name: string; email: string; password: string; onboarding: OnboardingInput }) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false
  });
}

export async function getMe() {
  return request<{ user: AuthResponse["user"] }>("/api/auth/me");
}

export async function logout() {
  await request<{ ok: true }>("/api/auth/logout", { method: "POST" });
  await clearSession();
}

export async function getDashboardSummary() {
  return request<DashboardSummary>("/api/dashboard/summary");
}

async function request<T>(path: string, init: ApiRequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined)
  };

  if (init.auth !== false) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? "تعذر الاتصال بالخادم");
  }
  return data as T;
}

type ApiRequestInit = RequestInit & {
  auth?: boolean;
};

export type DashboardSummary = {
  calories: { value: number; target: number | null };
  protein: { value: number; target: number | null };
  weight: number | null;
  workouts: { value: number; target: number | null };
  todayWorkout: {
    exercises: Array<{
      id: string;
      name: string;
      muscleGroup: string;
      sets: Array<{ id: string; reps: number; completed: boolean }>;
    }>;
  } | null;
};
