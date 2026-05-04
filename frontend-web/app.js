document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const signupForm = document.getElementById("signupForm");
const signupStatus = document.getElementById("signupStatus");
const apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:4000`;

function toNumber(value) {
  return Number.parseFloat(value);
}

function setSignupStatus(message, type = "") {
  signupStatus.textContent = message;
  signupStatus.className = `form-status ${type}`.trim();
}

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = signupForm.querySelector("button[type='submit']");
  const formData = new FormData(signupForm);

  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
    onboarding: {
      gender: formData.get("gender"),
      age: Number.parseInt(String(formData.get("age")), 10),
      heightCm: toNumber(formData.get("heightCm")),
      currentWeightKg: toNumber(formData.get("currentWeightKg")),
      bodyFatPercent: null,
      goal: formData.get("goal"),
      targetWeightKg: toNumber(formData.get("targetWeightKg")),
      weeklyChangeKg: 0.5,
      deadline: null,
      activityLevel: "moderate",
      workoutDaysPerWeek: Number.parseInt(String(formData.get("workoutDaysPerWeek")), 10),
      equipment: "gym",
      experienceLevel: "beginner",
      limitations: null
    }
  };

  submitButton.disabled = true;
  setSignupStatus("جاري إنشاء الحساب...");

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "تعذر إنشاء الحساب. تأكد أن الباكند شغال.");
    }

    setSignupStatus(`تم إنشاء الحساب بنجاح: ${data.user?.email || payload.email}`, "success");
    signupForm.reset();
  } catch (error) {
    setSignupStatus(error.message || "صار خطأ أثناء إنشاء الحساب.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
