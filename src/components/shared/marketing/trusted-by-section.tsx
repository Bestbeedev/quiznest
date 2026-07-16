import { AUDIENCES } from "@/constants/marketing";
import { Reveal } from "@/components/shared/reveal";

export function TrustedBySection() {
  return (
    <section className="border-y bg-muted/30 py-10">
      <Reveal className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6">
        <p className="text-sm font-medium text-muted-foreground">Conçu pour</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {AUDIENCES.map((audience) => (
            <div key={audience.title} className="flex items-center gap-2 text-muted-foreground">
              <audience.icon className="size-5" />
              <span className="text-sm font-medium">{audience.title}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
