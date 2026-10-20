import Link from "next/link";
import { redirect } from "next/navigation";
import { Flash } from "@/components/Flash";
import { getSessionUser } from "@/lib/server/auth";
import { signup } from "./actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  if (await getSessionUser()) redirect("/");
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1>Create your account</h1>
        <p className="muted">Free. Build, tailor and download professional resumes.</p>
        <Flash searchParams={await searchParams} />
        <form action={signup}>
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required maxLength={120} />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Password <span className="hint">(12+ characters, letters and numbers)</span></label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={12} />
          <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn primary" type="submit">Create account</button>
            <Link href="/login">I already have an account</Link>
          </div>
          <p className="signup-note" style={{ marginTop: 12 }}>Your resumes are private to your account. Only include information you are comfortable storing.</p>
        </form>
      </div>
    </div>
  );
}
