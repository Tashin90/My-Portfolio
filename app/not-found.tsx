import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center overflow-hidden bg-[#060816] px-6 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.2),transparent_28rem),radial-gradient(circle_at_80%_70%,rgba(34,211,238,.12),transparent_26rem)]"/><div className="relative max-w-xl text-center"><p className="font-mono text-xs uppercase tracking-[.25em] text-violet-200">404 / Not found</p><h1 className="mt-6 text-5xl font-semibold tracking-[-.06em] sm:text-7xl">This page took a wrong turn.</h1><p className="mt-6 leading-7 text-slate-400">The page you are looking for does not exist, but the portfolio is still right this way.</p><Link href="/" className="focus-ring mt-9 inline-flex rounded-xl bg-violet-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white">Back to Home</Link></div></main>;
}
