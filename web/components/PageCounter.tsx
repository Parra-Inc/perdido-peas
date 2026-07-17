export default function PageCounter({ label, special }: { label: string; special?: boolean }) {
  return (
    <div
      className={
        special
          ? "min-w-28 rounded-full bg-white/80 px-5 py-2 text-center text-lg font-bold text-emerald-sea shadow-md"
          : "min-w-28 rounded-full bg-cap-navy px-5 py-2 text-center text-base font-bold text-sunshine shadow-md"
      }
    >
      {label}
    </div>
  );
}
