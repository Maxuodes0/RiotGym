export const summary = {
  calories: { value: 1840, target: 2400 },
  protein: { value: 142, target: 160 },
  weight: "84.2",
  workouts: "3/4"
};

export const todayWorkout = [
  {
    name: "Bench Press",
    muscle: "صدر",
    sets: [
      { reps: 8, weight: 80, rpe: 8, done: true },
      { reps: 8, weight: 82.5, rpe: 8, done: true },
      { reps: 6, weight: 85, rpe: 9, done: false }
    ]
  },
  {
    name: "Shoulder Press",
    muscle: "أكتاف",
    sets: [
      { reps: 10, weight: 32.5, rpe: 7, done: true },
      { reps: 9, weight: 35, rpe: 8, done: false },
      { reps: 8, weight: 35, rpe: 8, done: false }
    ]
  },
  {
    name: "Cable Triceps",
    muscle: "ترايسبس",
    sets: [
      { reps: 12, weight: 25, rpe: 7, done: false },
      { reps: 12, weight: 27.5, rpe: 8, done: false }
    ]
  }
];

export const meals = [
  { name: "فطور", details: "بيض، توست، قهوة", calories: 520, protein: 34 },
  { name: "غداء", details: "رز، دجاج، سلطة", calories: 780, protein: 62 },
  { name: "سناك", details: "زبادي يوناني، موز", calories: 260, protein: 24 },
  { name: "عشاء", details: "متبقي للتسجيل", calories: 0, protein: 0 }
];

export const macros = [
  { label: "السعرات", value: 1840, target: 2400, unit: "kcal", color: "#0F6B5D" },
  { label: "البروتين", value: 142, target: 160, unit: "g", color: "#D4892F" },
  { label: "الكارب", value: 205, target: 280, unit: "g", color: "#2D628F" },
  { label: "الدهون", value: 54, target: 75, unit: "g", color: "#B94A48" }
];

export const activity = [42, 68, 35, 82, 48, 74, 58];
export const weightTrend = [85.1, 84.9, 84.8, 84.5, 84.4, 84.2];

export const records = [
  { name: "Bench Press", value: "92.5kg", change: "+2.5kg خلال 30 يوم" },
  { name: "Squat", value: "130kg", change: "ثابت" },
  { name: "Deadlift", value: "165kg", change: "+5kg خلال 30 يوم" },
  { name: "Shoulder Press", value: "42.5kg", change: "+2.5kg خلال 30 يوم" }
];

export const goals = [
  { title: "وزن الهدف", value: "82.0kg", details: "الوصول لوزن نظيف مع الحفاظ على القوة.", progress: 68 },
  { title: "تمارين أسبوعية", value: "4 أيام", details: "ثلاثة أيام مكتملة وباقي يوم واحد.", progress: 75 },
  { title: "بروتين يومي", value: "160g", details: "المتوسط الحالي ممتاز وقريب من الهدف.", progress: 89 },
  { title: "ماء", value: "3L", details: "احتياج اليوم ناقصه تقريبًا 900ml.", progress: 70 },
  { title: "نوم", value: "7.5h", details: "متوسط الأسبوع 6.8 ساعات.", progress: 84 },
  { title: "خطوات", value: "8,000", details: "وصلت 5,900 خطوة حتى الآن.", progress: 73 }
];
