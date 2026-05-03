import { z } from "zod";

export const onboardingSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(13).max(100),
  heightCm: z.number().min(100).max(240),
  currentWeightKg: z.number().min(30).max(300),
  bodyFatPercent: z.number().min(3).max(70).optional().nullable(),
  goal: z.enum(["lose", "maintain", "gain"]),
  targetWeightKg: z.number().min(30).max(300),
  weeklyChangeKg: z.number().min(0).max(1.5),
  deadline: z.coerce.date().optional().nullable(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  workoutDaysPerWeek: z.number().int().min(1).max(7),
  equipment: z.enum(["gym", "home", "none"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  limitations: z.string().max(500).optional().nullable()
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export function normalizeOnboarding(onboarding: OnboardingInput) {
  return {
    ...onboarding,
    bodyFatPercent: onboarding.bodyFatPercent ?? undefined,
    deadline: onboarding.deadline ?? undefined,
    limitations: onboarding.limitations ?? undefined
  };
}
