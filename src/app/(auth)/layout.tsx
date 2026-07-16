import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-1">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 lg:flex">
        <Logo />
        <div className="space-y-3">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Créez, partagez et analysez
            <br />
            <span className="text-primary">vos évaluations.</span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            La plateforme d&apos;évaluation nouvelle génération pour l&apos;éducation, les
            entreprises et les organisations.
          </p>
        </div>
        <div aria-hidden className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} QuizNest
        </div>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">{children}</div>
    </div>
  );
}
