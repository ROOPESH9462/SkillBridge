export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
};

export function isValidTransition(currentStatus: string, nextStatus: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}

export function validateSessionDuration(start: Date, end: Date, expectedDurationMinutes: number = 45): boolean {
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  return diffMinutes === expectedDurationMinutes && start < end;
}
