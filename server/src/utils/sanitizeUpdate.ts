// Strips identity fields from a PUT body so a client cannot rewrite a record's
// id or reassign its owner. Renaming `id` would also collide with the
// { userId, id } unique index on every collection.
export function sanitizeUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...body };
  delete rest.id;
  delete rest._id;
  delete rest.userId;
  delete rest.createdAt;
  delete rest.updatedAt;
  return rest;
}
