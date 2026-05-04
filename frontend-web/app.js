const state = {
  view: "dashboard",
  workouts: [
    {
      name: "Bench Press",
      muscle: "صدر",
      sets: [
        { reps: 8, weight: 80, rpe: 8, done: true },
        { reps: 8, weight: 82.5, rpe: 8, done: true },
        { reps: 6, weight: 85, rpe: 9, done: false },
      ],
    },
    {
      name: "Shoulder Press",
      muscle: "أكتاف",
      sets: [
        { reps: 10, weight: 32.5, rpe: 7, done: true },
        { reps: 9, weight: 35, rpe: 8, done: false },
        { reps: 8, weight: 35, rpe: 8, done: false },
      ],
    },
    {
      name: "Cable Triceps",
      muscle: "ترايسبس",
      sets: [
        { reps: 12, weight: 25, rpe: 7, done: false },
        { reps: 12, weight: 27.5, rpe: 8, done: false },
      ],
    },
  ],
  macros: [
    { label: "Calories", value: 1840, target: 2400, unit: "kcal", color: "" },
    { label: "Protein", value: 142, target: 160, unit: "g", color: "amber" },
    { label: "Carbs", value: 205, target: 280, unit: "g", color: "blue" },
    { label: "Fats", value: 54, target: 75, unit: "g", color: "" },
  ],
  meals: [
    { name: "فطور", detail: "بيض، توست، قهوة", calories: 520, protein: 34 },
    { name: "غداء", detail: "رز، دجاج، سلطة", calories: 780, protein: 62 },
    { name: "سناك", detail: "زبادي يوناني، موز", calories: 260, protein: 24 },
    { name: "عشاء", detail: "متبقي للتسجيل", calories: 0, protein: 0 },
  ],
};

const titles = {
  dashboard: "الرئيسية",
  workouts: "التمارين",
  nutrition: "التغذية",
  progress: "التقدم",
  goals: "الأهداف",
};

const templates = [
  ["Push", "صدر، أكتاف، ترايسبس", "اليوم"],
  ["Pull", "ظهر، بايسبس", "غدًا"],
  ["Legs", "أرجل، سمانة", "الخميس"],
  ["Upper", "حجم متوسط", "السبت"],
];

const records = [
  ["Bench Press", "92.5kg", "+2.5kg خلال 30 يوم"],
  ["Squat", "130kg", "ثابت"],
  ["Deadlift", "165kg", "+5kg خلال 30 يوم"],
  ["Shoulder Press", "42.5kg", "+2.5kg خلال 30 يوم"],
];

const goals = [
  ["وزن الهدف", "82.0kg", "الوصول لوزن نظيف مع الحفاظ على القوة.", 68],
  ["تمارين أسبوعية", "4 أيام", "ثلاثة أيام مكتملة وباقي يوم واحد.", 75],
  ["بروتين يومي", "160g", "المتوسط الحالي ممتاز وقريب من الهدف.", 89],
  ["ماء", "3L", "احتياج اليوم ناقصه تقريبًا 900ml.", 70],
  ["نوم", "7.5h", "متوسط الأسبوع 6.8 ساعات.", 84],
  ["خطوات", "8,000", "وصلت 5,900 خطوة حتى الآن.", 73],
];

function setView(view) {
  state.view = view;
  document.querySelectorAll(".view").forEach((el) => el.classList.toggle("active", el.id === view));
  document.querySelectorAll("[data-view]").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  document.getElementById("viewTitle").textContent = titles[view];
  requestAnimationFrame(drawCharts);
}

function renderWorkoutSummary() {
  const target = document.getElementById("todayWorkout");
  target.innerHTML = state.workouts.map((exercise) => {
    const done = exercise.sets.filter((set) => set.done).length;
    return `
      <div class="exercise-row">
        <div>
          <strong>${exercise.name}</strong>
          <small>${exercise.muscle} · ${done}/${exercise.sets.length} sets</small>
        </div>
        <span class="pill">${exercise.sets.reduce((sum, set) => sum + set.reps, 0)} reps</span>
      </div>
    `;
  }).join("");
}

function renderWorkoutEditor() {
  const target = document.getElementById("workoutEditor");
  target.innerHTML = state.workouts.map((exercise, exerciseIndex) => `
    <section class="workout-card">
      <div class="workout-card-header">
        <div>
          <strong>${exercise.name}</strong>
          <small>${exercise.muscle}</small>
        </div>
        <button class="ghost-button" data-add-set="${exerciseIndex}" type="button">+ Set</button>
      </div>
      <div class="set-grid header"><span>#</span><span>Reps</span><span>Kg</span><span>RPE</span><span></span></div>
      ${exercise.sets.map((set, setIndex) => `
        <div class="set-grid">
          <span>${setIndex + 1}</span>
          <input inputmode="numeric" value="${set.reps}" data-field="reps" data-exercise="${exerciseIndex}" data-set="${setIndex}">
          <input inputmode="decimal" value="${set.weight}" data-field="weight" data-exercise="${exerciseIndex}" data-set="${setIndex}">
          <input inputmode="numeric" value="${set.rpe}" data-field="rpe" data-exercise="${exerciseIndex}" data-set="${setIndex}">
          <button class="check-button ${set.done ? "done" : ""}" data-toggle-set="${exerciseIndex}:${setIndex}" type="button">✓</button>
        </div>
      `).join("")}
    </section>
  `).join("");
}

function renderTemplates() {
  document.getElementById("templateList").innerHTML = templates.map(([name, detail, day]) => `
    <div class="template-row">
      <div><strong>${name}</strong><small>${detail}</small></div>
      <span class="pill">${day}</span>
    </div>
  `).join("");
}

function renderNutrition() {
  document.getElementById("macroStack").innerHTML = state.macros.map((macro) => {
    const pct = Math.min(100, Math.round((macro.value / macro.target) * 100));
    return `
      <div class="macro-row">
        <div class="metric-label"><span>${macro.label}</span><strong>${macro.value}/${macro.target}${macro.unit}</strong></div>
        <div class="metric-bar"><span class="${macro.color}" style="width:${pct}%"></span></div>
      </div>
    `;
  }).join("");

  document.getElementById("mealList").innerHTML = state.meals.map((meal) => `
    <div class="meal-row">
      <div><strong>${meal.name}</strong><small>${meal.detail}</small></div>
      <span class="pill">${meal.calories} kcal · ${meal.protein}g</span>
    </div>
  `).join("");
}

function renderProgress() {
  document.getElementById("recordList").innerHTML = records.map(([name, value, detail]) => `
    <div class="record-row">
      <div><strong>${name}</strong><small>${detail}</small></div>
      <span class="pill">${value}</span>
    </div>
  `).join("");
}

function renderGoals() {
  document.getElementById("goalsGrid").innerHTML = goals.map(([label, value, text, pct]) => `
    <article class="goal-card">
      <span class="eyebrow">${label}</span>
      <strong>${value}</strong>
      <p>${text}</p>
      <div class="metric-bar"><span style="width:${pct}%"></span></div>
    </article>
  `).join("");
}

function drawBarChart(canvasId, values, labels, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const logicalHeight = Number(canvas.dataset.logicalHeight || canvas.getAttribute("height") || 190);
  canvas.dataset.logicalHeight = String(logicalHeight);
  canvas.width = rect.width * dpr;
  canvas.height = logicalHeight * dpr;
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = logicalHeight;
  ctx.clearRect(0, 0, width, height);
  const max = Math.max(...values) * 1.18;
  const gap = 12;
  const barWidth = (width - gap * (values.length + 1)) / values.length;
  ctx.font = "12px system-ui";
  values.forEach((value, index) => {
    const x = gap + index * (barWidth + gap);
    const barHeight = (value / max) * (height - 44);
    const y = height - 28 - barHeight;
    roundRect(ctx, x, y, barWidth, barHeight, 7, color);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted");
    ctx.textAlign = "center";
    ctx.fillText(labels[index], x + barWidth / 2, height - 8);
  });
}

function drawLineChart() {
  const canvas = document.getElementById("weightChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const logicalHeight = Number(canvas.dataset.logicalHeight || canvas.getAttribute("height") || 230);
  canvas.dataset.logicalHeight = String(logicalHeight);
  canvas.width = rect.width * dpr;
  canvas.height = logicalHeight * dpr;
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = logicalHeight;
  const values = [85.1, 84.9, 84.8, 84.5, 84.4, 84.2];
  const min = Math.min(...values) - .4;
  const max = Math.max(...values) + .4;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(108,116,111,.22)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#e93565";
  ctx.lineWidth = 3;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = 18 + index * ((width - 36) / (values.length - 1));
    const y = 18 + ((max - value) / (max - min)) * (height - 48);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  values.forEach((value, index) => {
    const x = 18 + index * ((width - 36) / (values.length - 1));
    const y = 18 + ((max - value) / (max - min)) * (height - 48);
    ctx.fillStyle = "#e93565";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function roundRect(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function drawCharts() {
  drawBarChart("activityChart", [42, 68, 35, 82, 48, 74, 58], ["س", "ح", "ن", "ث", "ر", "خ", "ج"], "#e93565");
  drawLineChart();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewJump));
  });

  document.getElementById("workoutEditor").addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle-set]");
    const add = event.target.closest("[data-add-set]");
    if (toggle) {
      const [exerciseIndex, setIndex] = toggle.dataset.toggleSet.split(":").map(Number);
      state.workouts[exerciseIndex].sets[setIndex].done = !state.workouts[exerciseIndex].sets[setIndex].done;
      renderAll();
      showToast("تم تحديث الست");
    }
    if (add) {
      const exerciseIndex = Number(add.dataset.addSet);
      state.workouts[exerciseIndex].sets.push({ reps: 10, weight: 0, rpe: 7, done: false });
      renderAll();
      showToast("تمت إضافة set");
    }
  });

  document.getElementById("workoutEditor").addEventListener("change", (event) => {
    const input = event.target.closest("input[data-field]");
    if (!input) return;
    const exercise = state.workouts[Number(input.dataset.exercise)];
    const set = exercise.sets[Number(input.dataset.set)];
    set[input.dataset.field] = Number(input.value);
    renderWorkoutSummary();
  });

  document.getElementById("finishWorkoutBtn").addEventListener("click", () => showToast("واجهة جاهزة: اربطها لاحقًا مع API حفظ التمرين"));
  document.getElementById("addMealBtn").addEventListener("click", () => showToast("واجهة الوجبات جاهزة للربط مع الباكند"));
  document.getElementById("quickLogBtn").addEventListener("click", () => document.getElementById("quickDialog").showModal());
  document.getElementById("saveQuickLog").addEventListener("click", () => showToast("تم حفظ التسجيل محليًا"));
  window.addEventListener("resize", drawCharts);
}

function renderAll() {
  renderWorkoutSummary();
  renderWorkoutEditor();
  renderTemplates();
  renderNutrition();
  renderProgress();
  renderGoals();
  drawCharts();
}

function init() {
  document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  bindEvents();
  renderAll();
}

init();
