type Tech = { id: string; canonicalName: string; category: string };

/** Grouped checkbox picker for catalog technologies (no client JS needed). */
export function TechPicker({ techs, selected, name = "techId", openAll = false }: { techs: Tech[]; selected: Set<string>; name?: string; openAll?: boolean }) {
  const groups = new Map<string, Tech[]>();
  for (const t of techs) groups.set(t.category, [...(groups.get(t.category) ?? []), t]);
  return (
    <div>
      {[...groups.entries()].map(([category, list]) => {
        const count = list.filter((t) => selected.has(t.id)).length;
        return (
          <details key={category} open={openAll || count > 0} style={{ marginBottom: 6 }}>
            <summary>
              {category} {count > 0 && <span className="badge info">{count} selected</span>}
            </summary>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0 12px", padding: "6px 0 6px 12px" }}>
              {list.map((t) => (
                <label key={t.id} className="check">
                  <input type="checkbox" name={name} value={t.id} defaultChecked={selected.has(t.id)} />
                  {t.canonicalName}
                </label>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
