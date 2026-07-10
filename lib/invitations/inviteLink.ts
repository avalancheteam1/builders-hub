import { baseUrl } from "@/utils/metadata";
import { MINI_GRANT_HACKATHON_ID, MINI_GRANT_SLUG } from "@/lib/grants/programs";

// Kept local rather than shared: build-games has no program module of its own yet.
const BUILD_GAMES_HACKATHON_ID = "249d2911-7931-4aa0-a696-37d8370b79f9";

export interface InviteLinkContext {
  hackathonId: string;
  projectId: string;
  /** Member row id — the token the accept flow validates. */
  memberId: string;
  /** build-games only: which submission stage to land on. */
  stage?: number;
}

/**
 * Where an invitation email should send its recipient. Each program that has its
 * own submission flow registers a builder here; everything else falls through to
 * the generic event project-submission page.
 *
 * A registry rather than an if/else chain on hackathon id: adding a program is a
 * new row, not an edit to shared branching that every other program flows through.
 */
const INVITE_LINK_BUILDERS: Record<string, (ctx: InviteLinkContext) => string> = {
  [BUILD_GAMES_HACKATHON_ID]: ({ stage, memberId }) =>
    `${baseUrl.origin}/build-games/submit?stage=${stage ?? 1}&invitation=${memberId}`,

  // The mini-grant wizard resolves the invitation from the project it targets, so
  // it takes ?project= rather than ?invitation=.
  [MINI_GRANT_HACKATHON_ID]: ({ projectId }) =>
    `${baseUrl.origin}/grants/${MINI_GRANT_SLUG}/apply?project=${projectId}`,
};

export function buildInviteLink(ctx: InviteLinkContext): string {
  const build = INVITE_LINK_BUILDERS[ctx.hackathonId];
  if (build) return build(ctx);
  return `${baseUrl.origin}/events/project-submission?event=${ctx.hackathonId}&invitation=${ctx.memberId}#team`;
}
