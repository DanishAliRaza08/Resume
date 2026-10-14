export function Flash({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const error = typeof searchParams.error === "string" ? searchParams.error : null;
  const ok = typeof searchParams.ok === "string" ? searchParams.ok : null;
  const denied = searchParams.denied === "1";
  return (
    <>
      {denied && <div className="notice bad" role="alert">You do not have permission to open that page.</div>}
      {error && <div className="notice bad" role="alert">{error}</div>}
      {ok && <div className="notice ok" role="status">{ok}</div>}
    </>
  );
}
