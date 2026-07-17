export default function PageCounter({ label }: { label: string }) {
  return (
    <div className="flex h-12 min-w-28 items-center justify-center rounded-full bg-cap-navy px-5 text-base font-bold text-sunshine shadow-[0_5px_0_rgba(29,53,87,0.35)]">
      {label}
    </div>
  );
}
