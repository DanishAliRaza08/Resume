// Stand-in for dice.com used by tests/e2e-dice/run.cjs. Not part of the app.
// A small stand-in for Dice: search pages, job pages and a 3-step Easy Apply wizard.
const http = require("http");
const id = (n) => `0000000${n}-aaaa-bbbb-cccc-000000000000`.slice(-36).replace(/^.{8}/, String(n).padStart(8, "0"));
const JOBS = {
  [id(1)]: { title: "Senior Business Analyst", company: "Acme Bank", kind: "easy", opens: "newtab" },
  [id(2)]: { title: "Business Analyst (External)", company: "Globex", kind: "external" },
  [id(3)]: { title: "Business Analyst - Broker Dealer", company: "Initech", kind: "easy", opens: "same", extraRequired: "Do you hold an active Series 7 license?" },
  [id(4)]: { title: "Business Analyst - Payments", company: "Umbrella", kind: "easy", opens: "same", checkbox: true },
  [id(5)]: { title: "Lead Business Analyst", company: "Hooli", kind: "applied" },
  [id(6)]: { title: "Business Analyst (closed)", company: "Vandelay", kind: "closed" },
  [id(7)]: { title: "BA - Lending", company: "Wayne Financial", kind: "easy", opens: "newtab" },
};
const PAGES = { 1: [id(1), id(2), id(3), id(4)], 2: [id(5), id(6), id(7)] };
const submitted = [];
const searches = [];
const page = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`;

function wizard(jid, step) {
  const j = JOBS[jid];
  if (step === 1) return page("Apply", `<h1>Apply: ${j.title}</h1><p>Step 1 of 3 — Resume</p><p>Using your Dice profile resume.</p><button onclick="location.href='?step=2'">Next</button>`);
  if (step === 2) {
    const extra = j.extraRequired ? `<fieldset aria-required="true"><legend>${j.extraRequired} *</legend><label><input type="radio" name="s7" value="Yes" required> Yes</label><label><input type="radio" name="s7" value="No"> No</label></fieldset>` : "";
    const cb = j.checkbox ? `<label><input type="checkbox" name="bg" id="bg"> Are you willing to undergo a background check?</label>` : "";
    return page("Apply", `<h1>Apply: ${j.title}</h1><p>Step 2 of 3 — Questions</p>
      <form id="f" onsubmit="return false">
      <fieldset aria-required="true"><legend>Are you legally authorized to work in the United States? *</legend>
        <label><input type="radio" name="auth" value="Yes" required> Yes</label><label><input type="radio" name="auth" value="No"> No</label></fieldset>
      <label for="yrs">How many years of experience do you have? *</label><input id="yrs" name="yrs" type="number" required>
      <label for="sp">Will you require visa sponsorship? *</label><select id="sp" name="sp" required><option value="">Select</option><option>Yes</option><option>No</option></select>
      <label for="cover">Anything else? (optional)</label><textarea id="cover" name="cover"></textarea>
      ${extra}${cb}
      <div id="err"></div>
      <button type="button" onclick="next()">Next</button></form>
      <script>
      function next(){ const f=document.getElementById('f'); if(!f.checkValidity()){ document.getElementById('err').innerHTML='<div role="alert">Please answer all required questions.</div>'; return; }
        const d=new FormData(f); sessionStorage.setItem('answers', JSON.stringify(Object.fromEntries(d))); location.href='?step=3'; }
      </script>`);
  }
  if (step === 3) return page("Apply", `<h1>Apply: ${j.title}</h1><p>Step 3 of 3 — Review</p><button onclick="fetch('/__submit',{method:'POST',body:JSON.stringify({id:'${jid}',answers:JSON.parse(sessionStorage.getItem('answers')||'{}')})}).then(()=>location.href='/job-applications/${jid}/success')">Submit</button>`);
}

http
  .createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    const send = (html, code = 200) => (res.writeHead(code, { "Content-Type": "text/html" }), res.end(html));
    if (u.pathname === "/__submit") {
      let b = "";
      req.on("data", (c) => (b += c));
      req.on("end", () => (submitted.push(JSON.parse(b)), res.end("ok")));
      return;
    }
    if (u.pathname === "/__state") return res.end(JSON.stringify({ submitted, searches }));
    if (u.pathname === "/jobs") {
      searches.push(Object.fromEntries(u.searchParams));
      const ids = PAGES[u.searchParams.get("page") || "1"] || [];
      // Results render a moment after load, like a single-page app.
      return send(page("Jobs", `<div id="r">Loading…</div><script>setTimeout(()=>{document.getElementById('r').innerHTML=${JSON.stringify(ids.map((i) => `<div><a href="/job-detail/${i}?searchlink=x">${JOBS[i].title}</a> ${JOBS[i].company}</div>`).join(""))}},400)</script>`));
    }
    let m = /^\/job-detail\/([0-9a-f-]{36})/.exec(u.pathname);
    if (m && JOBS[m[1]]) {
      const j = JOBS[m[1]];
      const btn =
        j.kind === "external" ? `<a href="https://example.com/careers">Apply Now</a>` :
        j.kind === "applied" ? `<p>Application submitted on 2026-10-01</p><button disabled>Applied</button>` :
        j.kind === "closed" ? `<p>This job is no longer available.</p>` :
        `<button onclick="${j.opens === "newtab" ? `window.open('/job-applications/${m[1]}/wizard?step=1','_blank')` : `location.href='/job-applications/${m[1]}/wizard?step=1'`}">Easy apply</button>`;
      return send(page(j.title, `<h1>${j.title}</h1><a data-cy="companyNameLink" href="#">${j.company}</a><div data-cy="location">Remote</div>${btn}<p>Job description…</p>`));
    }
    m = /^\/job-applications\/([0-9a-f-]{36})\/(wizard|success)/.exec(u.pathname);
    if (m) return send(m[2] === "success" ? page("Done", `<h1>Application submitted</h1><p>Thanks for applying!</p>`) : wizard(m[1], Number(u.searchParams.get("step") || 1)));
    send(page("Dice", "<h1>Dice home</h1>"));
  })
  .listen(Number(process.argv[2] || 4555), "127.0.0.1", () => console.log("mock dice ready"));
