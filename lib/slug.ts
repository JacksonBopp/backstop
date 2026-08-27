import { randomUUID } from "crypto";

/** Unguessable share token for a team's public pulse link. */
export function generateTeamSlug(): string {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}
