import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="glass-card mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <span className="text-5xl font-bold gradient-text">404</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="mt-2 text-sm text-white/50">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
