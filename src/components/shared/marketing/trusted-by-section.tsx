import { TRUSTED_BY } from "@/constants/marketing";

export function TrustedBySection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-center text-xs font-medium tracking-widest uppercase text-muted-foreground">
          Ils nous font confiance
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUSTED_BY.map((org) => (
            <div
              key={org.name}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {org.initials}
              </span>
              {org.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
