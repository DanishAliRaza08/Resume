import { redirect } from "next/navigation";
import { Flash } from "@/components/Flash";
import { BrandName, Credit } from "@/components/Logo";
import { getSessionUser } from "@/lib/server/auth";
import { login } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  if (await getSessionUser()) redirect("/");
  const sp = await searchParams;
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div style={{ marginBottom: 12 }}><BrandName /></div>
        <h1>Sign in</h1>
        <p className="muted">Welcome back.</p>
        <Flash searchParams={sp} />
        <form action={login}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn primary" type="submit">Sign in</button>
            <a href="/reset-password">Forgot password?</a>
          </div>
        </form>
        <p style={{ marginTop: 16 }}>New here? <a href="/signup"><strong>Create a free account</strong></a></p>
        <Credit />
      </div>
    </div>
  );
}
