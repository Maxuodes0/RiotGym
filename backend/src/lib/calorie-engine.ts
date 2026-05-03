import { OnboardingInput } from "./onboarding-schema.js";

export function calculateTargets(onboarding: OnboardingInput) {
  const bmr =
    onboarding.gender === "male"
      ? 10 * onboarding.currentWeightKg + 6.25 * onboarding.heightCm - 5 * onboarding.age + 5
      : 10 * onboarding.currentWeightKg + 6.25 * onboarding.heightCm - 5 * onboarding.age - 161;

  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }[onboarding.activityLevel];

  const tdee = bmr * activityMultiplier;
  const weeklyOffset = onboarding.weeklyChangeKg * 7700 / 7;
  const calories =
    onboarding.goal === "lose" ? tdee - weeklyOffset : onboarding.goal === "gain" ? tdee + weeklyOffset : tdee;

  return {
    calories: Math.max(1200, Math.round(calories)),
    protein: Math.round(onboarding.currentWeightKg * 1.8)
  };
}
