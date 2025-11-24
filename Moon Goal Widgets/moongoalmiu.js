// ==============================
// GOAL STATE & ROTATION (clean)
// ==============================

const goals = {
  follower: { key: "follower", label: "Follower Goal", themeClass: "goal-follower", current: 0, target: 50 },
  sub:      { key: "sub",      label: "Sub Goal",      themeClass: "goal-sub",      current: 0, target: 25 },
  bits:     { key: "bits",     label: "Bits Goal",     themeClass: "goal-cheer",    current: 0, target: 5000 },
  charity:  { key: "charity",  label: "Charity Goal",  themeClass: "goal-charity",  current: 0, target: 200 }
};

const cycleOrder = ["follower","sub","bits","charity"];
let cycleIndex = 0;
let currentGoalKey = cycleOrder[0];

// DOM anchors
const mainRoot = document.querySelector("#goalWidget") || document.body;
const titleEls = mainRoot.querySelectorAll(".textelement .title");
const textBottomEl = mainRoot.querySelector(".textbottom .text1") || mainRoot.querySelector(".textelement .text1");

// set video src override (in case)
const moonVideo = mainRoot.querySelector(".moon-video");
if (moonVideo) {
  moonVideo.src = "https://raw.githubusercontent.com/VerseMessiah/Overlay-Assets/main/webms/FullMoon.webm";
}

// render currently active goal
function renderMainGoal(){
  const goal = goals[currentGoalKey];
  if (!goal) return;

  const cur = Number(goal.current) || 0;
  const tgt = Number(goal.target) || 0;
  const pct = tgt > 0 ? Math.max(0, Math.min(100, (cur/tgt)*100)) : 0;
  const fillLevel = pct / 100;

  // apply theme class
  mainRoot.classList.remove("goal-follower","goal-sub","goal-cheer","goal-charity");
  if (goal.themeClass) mainRoot.classList.add(goal.themeClass);

  // update CSS var controlling visual fill
  mainRoot.style.setProperty("--goal-fill-level", String(fillLevel));

  // set titles & progress
  titleEls.forEach(el => el.textContent = goal.label);
  const progressText = `${Math.floor(cur)} / ${Math.floor(tgt)} (${Math.round(pct)}%)`;
  if (textBottomEl) textBottomEl.textContent = progressText;
}

// rotation
function rotateGoals(){
  cycleIndex = (cycleIndex + 1) % cycleOrder.length;
  currentGoalKey = cycleOrder[cycleIndex];
  renderMainGoal();
}
setInterval(rotateGoals, 30000);
renderMainGoal();

// ==============================
// API for MixItUp actions
// ==============================
function updateGoalState(goalType, current, target){
  if (!goalType) return;
  let key = String(goalType).toLowerCase().trim();
  if (key === "followers" || key === "follow") key = "follower";
  if (key === "subscribers" || key === "subscription") key = "sub";
  if (key === "cheer" || key === "cheers") key = "bits";

  const goal = goals[key];
  if (!goal) return;

  const curNum = Number(current);
  const tgtNum = Number(target);
  if (!isNaN(curNum)) goal.current = curNum;
  if (!isNaN(tgtNum)) goal.target = tgtNum;

  // if updating whichever is currently showing, re-render
  if (key === currentGoalKey) renderMainGoal();
}

// ------------------------------
// Spotlight popup
// ------------------------------
const spotlightEl = document.getElementById("goal-spotlight");
const spotTitle = spotlightEl && spotlightEl.querySelector(".goal-spotlight-title");
const spotMsg   = spotlightEl && spotlightEl.querySelector(".goal-spotlight-message");
const spotProg  = spotlightEl && spotlightEl.querySelector(".goal-spotlight-progress");
let spotTimeout = null;

function spotlightGoal(goalType, messageText){
  if (!spotlightEl) return;
  let key = String(goalType || "").toLowerCase().trim();
  if (key === "followers" || key === "follow") key = "follower";
  if (key === "subscribers" || key === "subscription") key = "sub";
  if (key === "cheer" || key === "cheers") key = "bits";

  const goal = goals[key];
  if (!goal) return;

  const cur = Number(goal.current) || 0;
  const tgt = Number(goal.target) || 0;
  const pct = tgt > 0 ? Math.max(0, Math.min(100, (cur/tgt)*100)) : 0;

  // theme popup
  spotlightEl.classList.remove("goal-follower","goal-sub","goal-cheer","goal-charity");
  if (goal.themeClass) spotlightEl.classList.add(goal.themeClass);

  if (spotTitle) spotTitle.textContent = goal.label;
  if (spotMsg) spotMsg.textContent = messageText || "New event";
  if (spotProg) spotProg.textContent = `${Math.floor(cur)} / ${Math.floor(tgt)} (${Math.round(pct)}%)`;

  // restart animation
  spotlightEl.classList.remove("visible");
  void spotlightEl.offsetWidth;
  spotlightEl.classList.add("visible");

  if (spotTimeout) clearTimeout(spotTimeout);
  spotTimeout = setTimeout(()=> spotlightEl.classList.remove("visible"), 7000);
}

// expose
window.updateGoalState = updateGoalState;
window.spotlightGoal = spotlightGoal;
