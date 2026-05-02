import { getSessionUserId } from "../state/session";

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
    body: JSON.stringify({ email, password })
  });
}

export async function register(payload: { name: string; email: string; password: string; onboarding: OnboardingInput }) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getDashboardSummary() {
  const userId = getSessionUserId();
  if (!userId) throw new Error("سجل الدخول أولًا");
  return request<DashboardSummary>(`/api/dashboard/summary?userId=${encodeURIComponent(userId)}`);
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? "تعذر الاتصال بالخادم");
  }
  return data as T;
}

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
