import Link from "next/link";

export default function PublicQuizLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        QuizNest
      </Link>
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  );
}
