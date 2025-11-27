console.log("🌙 JS Loaded (FINAL REWRITE)");

// =======================================================
//  GOAL DEFINITIONS (DEFAULTS FOR PREVIEW ONLY)
//  These get overwritten as soon as MixItUp sends real data
// =======================================================
const goals = {
  follower: {
    key: "follower",
    label: "Follower Goal",
    themeClass: "goal-follower",
    current: 0,   // segment progress (new)
    target: 50,   // segment target
    actual: 242,    // total real followers
  },
  sub: {
    key: "sub",
    label: "Sub Goal",
    themeClass: "goal-sub",
    current: 0,
    target: 25,
    actual: 25,    // total real subs
  },
  bits: {
    key: "bits",
    label: "Bits Goal",
    themeClass: "goal-cheer",
    current: 685,
    target: 1000,
  },
  charity: {
    key: "charity",
    label: "Charity Goal",
    themeClass: "goal-charity",
    current: 0,
    target: 500,
  },
};

// cycling
const cycleOrder = ["follower", "sub", "bits"];
let cycleIndex = 0;
let currentGoalKey = cycleOrder[0];

// DOM anchors
const mainRoot = document.getElementById("goalWidget");
const titleEl  = mainRoot?.querySelector("#goalTitleBottom");
const line2El  = mainRoot?.querySelector("#goalTextBottom");

// =======================================================
//  RENDER WIDGET (Updates fill + text)
// =======================================================
function renderMainGoal() {
  const goal = goals[currentGoalKey];
  if (!goal) return;

  const segCur = Number(goal.current) || 0;
  const segTgt = Number(goal.target) || 0;
  const segPct = segTgt > 0 ? Math.min(100, (segCur / segTgt) * 100) : 0;

  mainRoot.style.setProperty("--goal-fill-level", String(segPct / 100));

  // theme class swapping
  mainRoot.classList.remove("goal-follower", "goal-sub", "goal-cheer", "goal-charity");
  if (goal.themeClass) mainRoot.classList.add(goal.themeClass);

  // ============================
  //  BUILD LINE 1 + LINE 2
  // ============================
  let line1 = "";
  let line2 = "";

  if (goal.key === "follower") {
    line1 = `New Follow Goal: ${segCur} / ${segTgt}`;
    line2 = `Current Followers: ${goal.actual ?? ""}`;
  }
  else if (goal.key === "sub") {
    line1 = `New Sub Goal: ${segCur} / ${segTgt}`;
    line2 = `Current Subs: ${goal.actual ?? ""}`;
  }
  else if (goal.key === "bits") {
    line1 = `Monthly Bits Goal: ${segCur} / ${segTgt}`;
    line2 = "";
  }
  else if (goal.key === "charity") {
    line1 = `Charity Goal: ${segCur} / ${segTgt}`;
    line2 = "";
  }

  if (titleEl) titleEl.textContent = line1;
  if (line2El) line2El.textContent = line2;

  console.log(`🌙 Rendered ${goal.key}`, { segCur, segTgt, actual: goal.actual });
}

// rotate every 30s
setInterval(() => {
  cycleIndex = (cycleIndex + 1) % cycleOrder.length;
  currentGoalKey = cycleOrder[cycleIndex];
  console.log("🔄 Rotating →", currentGoalKey);
  renderMainGoal();
}, 30000);

// =======================================================
//  MIXITUP PACKET → UPDATE GOAL STATE
// =======================================================
window.updateGoalState = function(packet) {
  try {
    console.log("📦 RAW DATA:", packet);

    // packet is always an OBJECT like:
    //   { goalType: "follower", current: "5", target: "250", actualTotal: "243" }
    //
    // MixItUp may nest inside "goalType" if misconfigured:
    //   { goalType: { goalType:"follower", current: "...", target:"...", actualTotal:"..." } }

    // Normalize wrapper
    let p = packet;
    if (typeof packet.goalType === "object") {
      p = packet.goalType;
    }

    console.log("📦 Extracted:", p);

    let key = String(p.goalType || "").toLowerCase().trim();
    if (key === "followers" || key === "follow") key = "follower";
    if (key === "subscribers" || key === "subscription") key = "sub";
    if (key === "cheer" || key === "cheers") key = "bits";

    const goal = goals[key];
    if (!goal) {
      console.warn("⚠ Unknown goal key:", key);
      return;
    }

    // Numeric extraction
    const seg = Number(p.current);
    const tgt = Number(p.target);
    const act = Number(p.actualTotal);

    if (!isNaN(seg)) goal.current = seg;
    if (!isNaN(tgt)) goal.target  = tgt;
    if (!isNaN(act)) goal.actual  = act;

    console.log("📦 Updated:", goal);

    if (key === currentGoalKey) {
      renderMainGoal();
    }

  } catch (err) {
    console.error("❌ updateGoalState ERROR:", err);
  }
};


// alias for MixItUp legacy
window.updateGoalStatus = window.updateGoalState;

// Initial render
renderMainGoal();