export function GovernanceChart() {
  const nodes = [
    {
      title: "Council",
      body: "The governing body that provides policy oversight and institutional stewardship.",
    },
    {
      title: "Management Board",
      body: "The executive coordination layer responsible for implementation, planning, and administration.",
    },
    {
      title: "Senate",
      body: "The principal academic authority guiding teaching, research, examinations, and standards.",
    },
    {
      title: "Committees",
      body: "Specialized structures that support finance, quality, appointments, and strategic review.",
    },
  ];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-sm rounded-[1.75rem] bg-slate-950 px-6 py-8 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Governing Body
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl">
            University Council
          </h3>
        </div>
        <div className="mx-auto h-10 w-px bg-slate-300" />
        <div className="grid gap-5 md:grid-cols-3">
          {nodes.slice(1).map((node) => (
            <article
              key={node.title}
              className="rounded-[1.5rem] bg-slate-50 p-6 text-center"
            >
              <h4 className="text-xl font-semibold text-slate-950">
                {node.title}
              </h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {node.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
