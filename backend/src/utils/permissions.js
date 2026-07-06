const ROLE_RANK = { guest: 0, member: 1, manager: 2, admin: 3, owner: 4 };

// Works whether `value` is a raw ObjectId or a populated document/object with `_id`.
function idOf(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
}

export function getMembership(project, userId) {
  const targetId = String(userId);
  if (idOf(project.owner) === targetId) return { role: "owner" };
  return project.members.find((m) => idOf(m.user) === targetId);
}

export function hasProjectAccess(project, userId) {
  return Boolean(getMembership(project, userId));
}

export function hasRoleAtLeast(project, userId, minRole) {
  const membership = getMembership(project, userId);
  if (!membership) return false;
  return ROLE_RANK[membership.role] >= ROLE_RANK[minRole];
}
