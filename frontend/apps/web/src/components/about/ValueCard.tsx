export function ValueCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-base leading-7 text-slate-600">{body}</p>
    </article>
  );
}
