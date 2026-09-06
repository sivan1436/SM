const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export function decodeCursor(value) {
  if (!value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!decoded.createdAt || !decoded.id) return null;
    return {
      createdAt: new Date(decoded.createdAt),
      id: decoded.id,
    };
  } catch {
    return null;
  }
}

export function encodeCursor(item) {
  return Buffer.from(JSON.stringify({
    createdAt: item.createdAt.toISOString(),
    id: item._id.toString(),
  })).toString("base64url");
}

export function cursorFilter(cursor) {
  if (!cursor) return {};
  return {
    $or: [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
    ],
  };
}

export function paginatedResult(items, limit) {
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  return {
    items: page,
    nextCursor: hasMore && page.length ? encodeCursor(page[page.length - 1]) : null,
    hasMore,
  };
}
