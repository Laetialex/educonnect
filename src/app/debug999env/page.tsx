function charInfo(value: string | undefined, label: string) {
  if (value === undefined) return { label, present: false };
  const chars = Array.from(value);
  return {
    label,
    present: true,
    length: value.length,
    codePointLength: chars.length,
    first15CharCodes: chars.slice(0, 15).map((c) => c.charCodeAt(0)),
    last10CharCodes: chars.slice(-10).map((c) => c.charCodeAt(0)),
    suspiciousChars: chars
      .map((c, i) => ({ i, code: c.charCodeAt(0) }))
      .filter((x) => x.code > 255),
    startsWithHttps: value.startsWith("https://"),
    startsWithEyJ: value.startsWith("eyJ"),
  };
}

export default function Debug999EnvPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const data = {
    url: charInfo(url, "NEXT_PUBLIC_SUPABASE_URL"),
    key: charInfo(key, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
