export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-12 w-72" />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="skeleton h-72" />
        <div className="skeleton h-72" />
      </div>
      <div className="skeleton h-64" />
    </div>
  );
}
