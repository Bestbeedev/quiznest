import Link from "next/link";

export function Logo({ iconOnly, href = "/" }: { iconOnly?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="14" cy="14" r="12" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
        <path
          d="M8 17c0-3.314 2.686-6 6-6s6 2.686 6 6"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 17a6 6 0 0 1 6-6"
          className="stroke-primary/50"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
        <path
          d="M11 12.5 9 9m8 3.5 2-3.5"
          className="stroke-primary"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="17" r="1.5" className="fill-primary" stroke="none" />
      </svg>
      {!iconOnly && <span className="text-lg font-bold tracking-tight">QuizNest</span>}
    </Link>
  );
}
