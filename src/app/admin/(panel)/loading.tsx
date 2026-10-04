/**
 * Loading boundary for the admin panel. Every page here reads live member and
 * payment data from MongoDB, which takes about a second from a serverless
 * function. Without this file a navigation shows the previous screen with no
 * feedback until the new page is ready, which reads as "the panel is slow".
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading…</p>

      <div className="hatch mb-6 h-9 w-56 animate-pulse" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((slot) => (
          <div key={slot} className="card h-28 animate-pulse" />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((slot) => (
          <div key={slot} className="card h-24 animate-pulse" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="hatch h-7 w-40 animate-pulse" />
          <div className="card h-20 animate-pulse" />
          <div className="card h-20 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="hatch h-7 w-44 animate-pulse" />
          <div className="card h-20 animate-pulse" />
          <div className="card h-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}