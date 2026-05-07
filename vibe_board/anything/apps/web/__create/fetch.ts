const originalFetch = fetch;

const getUrlFromArgs = (...args: Parameters<typeof originalFetch>): string => {
  const [input] = args;
  if (typeof input === 'string') return input;
  if (input instanceof Request) return input.url;
  return `${input.protocol}//${input.host}${input.pathname}`;
};

const isFirstPartyURL = (url: string) => {
  return url.startsWith('/integrations') || url.startsWith('/_create');
};

const isSecondPartyUrl = (url: string) => {
  return (
    (process.env.NEXT_PUBLIC_CREATE_API_BASE_URL &&
      url.startsWith(process.env.NEXT_PUBLIC_CREATE_API_BASE_URL)) ||
    (process.env.NEXT_PUBLIC_CREATE_BASE_URL &&
      url.startsWith(process.env.NEXT_PUBLIC_CREATE_BASE_URL)) ||
    url.startsWith('https://www.create.xyz') ||
    url.startsWith('https://api.create.xyz/') ||
    url.startsWith('https://www.createanything.com') ||
    url.startsWith('https://api.createanything.com')
  );
};

const fetchWithHeaders = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = getUrlFromArgs(input, init);

  const additionalHeaders = {
    'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
  };

  const isExternalFetch = !isFirstPartyURL(url) && !isSecondPartyUrl(url);
  if (isExternalFetch || url.startsWith('/api')) {
    return originalFetch(input, init);
  }

  let finalInit: RequestInit;
  if (input instanceof Request) {
    const hasBody = !!input.body;
    finalInit = {
      method: input.method,
      headers: new Headers(input.headers),
      body: input.body,
      mode: input.mode,
      credentials: input.credentials,
      cache: input.cache,
      redirect: input.redirect,
      referrer: input.referrer,
      referrerPolicy: input.referrerPolicy,
      integrity: input.integrity,
      keepalive: input.keepalive,
      signal: input.signal,
      ...(hasBody ? { duplex: 'half' } : {}),
      ...init,
    };
  } else {
    finalInit = { ...init, headers: new Headers(init?.headers ?? {}) };
  }

  const finalHeaders = new Headers(finalInit.headers);
  for (const [key, value] of Object.entries(additionalHeaders)) {
    if (value) finalHeaders.set(key, value);
  }
  finalInit.headers = finalHeaders;

  const prefix = !isSecondPartyUrl(url)
    ? (process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz')
    : '';

  return originalFetch(`${prefix}${url}`, finalInit);
};

export default fetchWithHeaders;
