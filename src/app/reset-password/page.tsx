import { Flash } from "@/components/Flash";
import { completeReset, requestReset } from "./actions";

export default async function ResetPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1>Reset password</h1>
        <Flash searchParams={sp} />
        {sp.token ? (
          <form action={completeReset}>
            <input type="hidden" name="token" value={sp.token} />
            <label htmlFor="password">New password <span className="hint">(12+ characters, letters and numbers)</span></label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
            <div className="actions" style={{ marginTop: 16 }}>
              <button className="btn primary" type="submit">Set password</button>
            </div>
          </form>
        ) : (
          <form action={requestReset}>
            <p className="muted small">An administrator can also issue a reset link from Administration → Users.</p>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
            <div className="actions" style={{ marginTop: 16 }}>
              <button className="btn primary" type="submit">Request reset link</button>
              <a href="/login">Back to sign in</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
