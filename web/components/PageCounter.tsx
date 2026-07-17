export default function PageCounter({ label }: { label: string }) {
  return (
    <div className="min-w-28 rounded-full bg-white/80 px-5 py-2 text-center text-lg font-bold text-emerald-sea shadow-md">
      {label}
    </div>
  );
}
