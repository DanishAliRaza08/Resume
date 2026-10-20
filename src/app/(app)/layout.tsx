import { BrandName, Credit } from "@/components/Logo";
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
              { href: "/update", label: "Tailor Existing Resume" },
              { href: "/apply", label: "Dice Apply" },
            ]
          : []),
        { href: "/resumes", label: "My Resumes" },
        { href: "/candidates", label: "People" },
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
      items: isAdmin ? [{ href: "/reports", label: "Reports" }, { href: "/admin", label: "Administration" }] : [],
    },
  ];
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <BrandName />
        </div>
        <Nav groups={groups.filter((g) => g.items.length > 0)} />
        <div className="userbox">
          <div>{user.name}</div>
          <div className="small">{user.role.toLowerCase()}</div>
          <form action={logout} style={{ marginTop: 8 }}>
            <button className="btn small" type="submit">Sign out</button>
          </form>
        </div>
        <Credit />
      </aside>
      <main id="main">
        {children}
        <footer className="appfooter">Benchsale Dan · Developed by Danish Ali Raza · © {new Date().getFullYear()}</footer>
      </main>
    </div>
  );
}
