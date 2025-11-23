initGoalWidget({
  type: "follower",          // "follower" | "sub" | "cheer" | "tip" | "charity"
  platform: "twitch",
  title: "Follower Goal",
  goal: $goalAmount,         // MixItUp variable for goal total
  current: $goalCurrent,     // MixItUp variable for current progress
  currency: "",
  textPosition: "bottom",
  glow: true,
  particles: true
});
