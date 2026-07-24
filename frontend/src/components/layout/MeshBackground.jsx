export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-[560px] bg-mesh-bg" />
      <div className="absolute left-[15%] top-24 h-72 w-72 rounded-full bg-brand/10 blur-[120px]" />
      <div className="absolute right-[10%] top-48 h-64 w-64 rounded-full bg-accent-cyan/[0.05] blur-[120px]" />
    </div>
  );
}
