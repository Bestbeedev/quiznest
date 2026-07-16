export const MEMBER_ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "ADMIN",
  "MANAGER",
  "EDITOR",
  "VIEWER",
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Roles ordered from least to most privileged, used for hierarchy checks. */
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
  SUPER_ADMIN: 5,
};

export function roleAtLeast(role: MemberRole, minimum: MemberRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum];
}
