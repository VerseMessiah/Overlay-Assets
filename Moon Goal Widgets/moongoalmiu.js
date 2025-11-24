// ==============================
// GOAL STATE & ROTATION
// ==============================

// Goal definitions (you can rename labels & targets)
const goals = {
  follower: {
    key: "follower",
    label: "Follower Goal",
    themeClass: "goal-follower",
    current: 0,
    target: 50,
  },
  sub: {
    key: "sub",
    label: "Sub Goal",
    themeClass: "goal-sub",
    current: 0,
    target: 25,
  },
  bits: {
    key: "bits",
    label: "Bits Goal",
    themeClass: "goal-cheer",
    current: 0,
    target: 5000,
  },
  charity: {
    key: "charity",
    label: "Charity Goal",
    themeClass: "goal-charity",
    current: 0,
    target: 200,
  },
};

const cycleOrder = ["follower", "sub", "bits", "charity"];
let cycleIndex = 0;
let currentGoalKey = cycleOrder[0];

// Cache main widget DOM
const mainRoot =
  document.querySelector("#goalWidget") ||    // ← best anchor
  document.querySelector(".goal-widget") ||
  document.querySelector(".content") ||
  document.body;

const titleEls = mainRoot.querySelectorAll(".textelement .title");
const textRightEl = mainRoot.querySelector(".textright .text1");
const textBottomEl = mainRoot.querySelector(".textbottom .text1");

// Make sure the main video uses your GitHub-hosted webm
const moonVideo = mainRoot.querySelector(".shape-box");
if (moonVideo) {
  moonVideo.src =
    "https://github.com/VerseMessiah/Overlay-Assets/raw/refs/heads/main/webms/FullMoon.webm";
}

// Helper: render the currently selected goal into the main moon widget
function renderMainGoal() {
  const goal = goals[currentGoalKey];
  if (!goal) return;

  const current = Number(goal.current) || 0;
  const target = Number(goal.target) || 0;
  const pct =
    target > 0 ? Math.max(0, Math.min(100, (current / target) * 100)) : 0;

  // Apply theme class to main root
  mainRoot.classList.remove(
    "goal-follower",
    "goal-sub",
    "goal-cheer",
    "goal-charity"
  );
  if (goal.themeClass) {
    mainRoot.classList.add(goal.themeClass);
  }

  // Title text (both top & bottom versions)
  titleEls.forEach((el) => {
    el.textContent = goal.label;
  });

  const progressText = `${Math.floor(current)} / ${Math.floor(
    target
  )} (${Math.round(pct)}%)`;

  if (textRightEl) textRightEl.textContent = progressText;
  if (textBottomEl) textBottomEl.textContent = progressText;
}

// Rotate goal every 30s
function rotateGoals() {
  cycleIndex = (cycleIndex + 1) % cycleOrder.length;
  currentGoalKey = cycleOrder[cycleIndex];
  renderMainGoal();
}

// Start rotation
setInterval(rotateGoals, 30000);
renderMainGoal();

// ==============================
// EXPOSED API FOR MIXITUP
// ==============================

// Called from MixItUp when you update a given goal's progress
function updateGoalState(goalType, current, target) {
  let key = String(goalType || "").toLowerCase().trim();

  // Normalize MixItUp goal widget types
  if (key === "followers" || key === "follow") key = "follower";
  if (key === "subscribers" || key === "sub" || key === "subscription") key = "sub";
  if (key === "bits" || key === "cheer" || key === "cheers") key = "bits";
  if (key === "donations" || key === "donation" || key === "charity") key = "charity";

  const goal = goals[key];
  if (!goal) return;

  const curNum = Number(current);
  const tgtNum = Number(target);

  if (!isNaN(curNum)) goal.current = curNum;
  if (!isNaN(tgtNum)) goal.target = tgtNum;

  if (key === currentGoalKey) {
    renderMainGoal();
  }
}

// ==============================
// SPOTLIGHT POPUP (2x SIZE, 7s)
// ==============================

const spotlightEl = document.getElementById("goal-spotlight");
const spotlightTitleEl =
  spotlightEl && spotlightEl.querySelector(".goal-spotlight-title");
const spotlightMessageEl =
  spotlightEl && spotlightEl.querySelector(".goal-spotlight-message");
const spotlightProgressEl =
  spotlightEl && spotlightEl.querySelector(".goal-spotlight-progress");

let spotlightTimeoutId = null;

// Called from MixItUp when a follow/sub/bits/charity event fires
function spotlightGoal(goalType, messageText) {
  if (!spotlightEl) return;

  const key = String(goalType || "").toLowerCase();
  const goal = goals[key];
  if (!goal) return;

  const current = Number(goal.current) || 0;
  const target = Number(goal.target) || 0;
  const pct =
    target > 0 ? Math.max(0, Math.min(100, (current / target) * 100)) : 0;

  // Theme on popup
  spotlightEl.classList.remove(
    "goal-follower",
    "goal-sub",
    "goal-cheer",
    "goal-charity"
  );
  if (goal.themeClass) {
    spotlightEl.classList.add(goal.themeClass);
  }

  if (spotlightTitleEl) spotlightTitleEl.textContent = goal.label;
  if (spotlightMessageEl) spotlightMessageEl.textContent =
    messageText || "New event";
  if (spotlightProgressEl)
    spotlightProgressEl.textContent = `${Math.floor(current)} / ${Math.floor(
      target
    )} (${Math.round(pct)}%)`;

  // Restart animation
  spotlightEl.classList.remove("visible");
  // force reflow so animation restarts
  void spotlightEl.offsetWidth;
  spotlightEl.classList.add("visible");

  if (spotlightTimeoutId) window.clearTimeout(spotlightTimeoutId);
  spotlightTimeoutId = window.setTimeout(() => {
    spotlightEl.classList.remove("visible");
  }, 7000); // 7 seconds
}

// Expose functions for MixItUp overlay JS actions
window.updateGoalState = updateGoalState;
window.spotlightGoal = spotlightGoal;