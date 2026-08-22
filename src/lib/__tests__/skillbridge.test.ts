import { hashPassword, comparePassword } from "../password";
import { generateSlotsForDate } from "../slot-generator";
import { isValidTransition, validateSessionDuration } from "../booking-rules";
import { calculateMentorMatchScore } from "../recommendation-engine";

async function runSystemTestSuite() {
  console.log("==========================================");
  console.log("   RUNNING SKILLBRIDGE AUTOMATED TESTS    ");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [PASS] ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ❌ ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing Tests
  console.log("1. Password Security & Bcrypt Hashing Tests:");
  const plain = "password123";
  const hashed = await hashPassword(plain);
  assert(hashed !== plain && hashed.length > 20, "Password is properly hashed with bcrypt");
  const match = await comparePassword(plain, hashed);
  assert(match === true, "Valid password comparison succeeds");
  const wrongMatch = await comparePassword("wrongpass", hashed);
  assert(wrongMatch === false, "Invalid password comparison is rejected");

  // 2. Booking State Transition & Duration Rules
  console.log("\n2. Session Booking State Transition & Duration Rules:");
  assert(isValidTransition("REQUESTED", "CONFIRMED") === true, "REQUESTED -> CONFIRMED transition allowed");
  assert(isValidTransition("CONFIRMED", "COMPLETED") === true, "CONFIRMED -> COMPLETED transition allowed");
  assert(isValidTransition("COMPLETED", "REQUESTED") === false, "COMPLETED -> REQUESTED transition rejected");
  assert(isValidTransition("CANCELLED", "CONFIRMED") === false, "CANCELLED -> CONFIRMED transition rejected");

  const now = new Date();
  const start = new Date(now.getTime() + 3600000);
  const validEnd = new Date(start.getTime() + 45 * 60000);
  const invalidEnd = new Date(start.getTime() + 60 * 60000);
  assert(validateSessionDuration(start, validEnd, 45) === true, "Exact 45-min duration validated");
  assert(validateSessionDuration(start, invalidEnd, 45) === false, "Non-45-min duration rejected");

  // 3. Dynamic Slot Generation & Overlap Detection Logic
  console.log("\n3. Dynamic Slot Generation & Overlap Protection Logic:");
  const windows = [{ dayOfWeek: 1, startTime: "10:00", endTime: "12:00", isActive: true }];
  const existingSessions = [
    {
      scheduledStart: new Date("2026-08-24T10:45:00"),
      scheduledEnd: new Date("2026-08-24T11:30:00"),
      status: "CONFIRMED",
    },
  ];

  const slots = generateSlotsForDate("2026-08-24", windows, existingSessions, 45);
  assert(slots.length > 0, "Slots generated dynamically from availability windows");
  const occupiedSlot = slots.find((s) => s.start === "10:45");
  assert(occupiedSlot !== undefined && occupiedSlot.available === false, "Occupied slot identified and flagged as unavailable");

  // 4. Recommendation Engine 6-Factor Scoring Tests
  console.log("\n4. Multi-Factor Recommendation Engine Tests:");
  const learnerGoals = [
    { skillId: "sk-1", skillName: "Next.js", targetLevel: "EXPERT", progressPct: 40 },
  ];
  const mentorCandidate = {
    id: "m-1",
    name: "Aarav Mehta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    title: "Senior Full Stack Architect",
    yearsExp: 8,
    rating: 4.9,
    reviewCount: 42,
    isVerified: true,
    skills: [
      { skillId: "sk-1", skillName: "Next.js", proficiency: "EXPERT", yearsExp: 6 },
    ],
    hasSlotsThisWeek: true,
    hasAvailabilityWindows: true,
    completedSessionsWithLearner: 1,
  };

  const result = calculateMentorMatchScore(learnerGoals, mentorCandidate);
  assert(result.score >= 80 && result.score <= 99, `Match score calculated correctly (${result.score}%)`);
  assert(result.reasons.length > 0, "Human-readable explanation reasons generated");
  assert(result.breakdown.skillMatch === 100, "Skill match score correctly weighted to 100%");

  console.log("\n==========================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSystemTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
