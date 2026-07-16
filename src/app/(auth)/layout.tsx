import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 p-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        QuizNest
      </Link>
      {children}
    </div>
  );
}
