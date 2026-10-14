import { Nav } from "@/components/Nav";
import { requireUser } from "@/lib/server/auth";
import { logout } from "../login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const groups = [
    {
      title: "Resumes",
      items: [
        { href: "/", label: "Dashboard" },
        ...(user.role === "ADMIN" || user.role === "CREATOR"
          ? [
              { href: "/resumes/new", label: "Create New Resume" },
              { href: "/update", label: "Update Existing Resume" },
            ]
          : []),
        { href: "/resumes", label: "Resume Library" },
        { href: "/candidates", label: "Candidates" },
        { href: "/jd", label: "JD Analyzer" },
      ],
    },
    {
      title: "Libraries",
      items: [
        { href: "/clients", label: "Clients" },
        { href: "/templates", label: "Project Templates" },
        { href: "/technologies", label: "Technologies" },
      ],
    },
    {
      title: "Insights",
      items: [{ href: "/reports", label: "Reports" }, ...(isAdmin ? [{ href: "/admin", label: "Administration" }] : [])],
    },
  ];
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          Resume Builder<small>Multi-domain · ATS optimization</small>
        </div>
        <Nav groups={groups} />
        <div className="userbox">
          <div>{user.name}</div>
          <div className="small">{user.role.toLowerCase()}</div>
          <form action={logout} style={{ marginTop: 8 }}>
            <button className="btn small" type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main id="main">{children}</main>
    </div>
  );
}
