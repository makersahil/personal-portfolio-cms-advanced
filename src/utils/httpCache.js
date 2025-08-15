import crypto from 'node:crypto';

const DEFAULT_CC = 'public, max-age=60, must-revalidate';

export function toHttpDate(d) {
  return new Date(d).toUTCString();
}

export function makeWeakEtag(body) {
  const str = typeof body === 'string' ? body : JSON.stringify(body);
  const hash = crypto.createHash('sha1').update(str).digest('base64').slice(0, 27);
  return `W/"${hash}:${str.length}"`;
}

export function isFresh(req, etag, lastModified) {
  const inm = req.headers['if-none-match'];
  const ims = req.headers['if-modified-since'];
  let fresh = false;

  if (inm && etag) {
    const list = inm.split(/\s*,\s*/);
    if (list.includes(etag) || list.includes('*')) fresh = true;
  }
  if (!fresh && ims && lastModified) {
    const imsTime = Date.parse(ims);
    const lmTime = Date.parse(lastModified);
    if (!Number.isNaN(imsTime) && !Number.isNaN(lmTime) && imsTime >= lmTime) fresh = true;
  }
  return fresh;
}

// Compute max(updatedAt) across items (or single record)
export function maxUpdatedAt(source) {
  if (!source) return null;
  const list = Array.isArray(source) ? source : [source];
  const ms = list.map((x) => (x?.updatedAt ? new Date(x.updatedAt).getTime() : 0)).filter(Boolean);
  if (!ms.length) return null;
  return new Date(Math.max(...ms));
}

/**
 * Sets ETag + Last-Modified + Cache-Control and handles 304 if fresh.
 * Usage: return sendCached(reply, req, body, { lastModified, cacheControl })
 */
export function sendCached(
  reply,
  req,
  body,
  { lastModified, cacheControl = DEFAULT_CC, statusCode = 200 } = {}
) {
  const etag = makeWeakEtag(body);
  if (lastModified)
    reply.header(
      'Last-Modified',
      typeof lastModified === 'string' ? lastModified : toHttpDate(lastModified)
    );
  reply.header('ETag', etag);
  reply.header('Cache-Control', cacheControl);

  const lmHeader = reply.getHeader('Last-Modified');
  if (isFresh(req, etag, lmHeader)) {
    return reply.code(304).send(); // Not Modified, no body
  }
  return reply.code(statusCode).send(body);
}
