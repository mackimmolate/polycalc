export function getHashAuthParams(rawHash: string): URLSearchParams | null {
  if (!rawHash) {
    return null;
  }

  const normalizedHash = rawHash.replace(/^#/, '');
  if (!normalizedHash) {
    return null;
  }

  const candidates = new Set<string>();
  candidates.add(normalizedHash);

  const fragmentParts = normalizedHash.split('#');
  if (fragmentParts.length > 1) {
    candidates.add(fragmentParts[fragmentParts.length - 1]);
  }

  const questionIndex = normalizedHash.indexOf('?');
  if (questionIndex >= 0 && questionIndex + 1 < normalizedHash.length) {
    candidates.add(normalizedHash.slice(questionIndex + 1));
  }

  let bestMatch: URLSearchParams | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const params = new URLSearchParams(candidate.startsWith('/') ? candidate.slice(1) : candidate);
    const score = [
      params.has('access_token'),
      params.has('refresh_token'),
      params.has('error'),
      params.has('error_description'),
      params.has('error_code'),
    ].filter(Boolean).length;

    if (score > bestScore) {
      bestMatch = params;
      bestScore = score;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

export function normalizeAuthError(value: string | null) {
  if (!value) {
    return null;
  }

  return decodeURIComponent(value.replace(/\+/g, ' '));
}
