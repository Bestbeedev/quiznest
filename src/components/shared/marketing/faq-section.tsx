import { FAQ_ITEMS } from "@/constants/marketing";
import { Reveal } from "@/components/shared/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Tout ce que vous devez savoir avant de commencer.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15} direction="up">
          <Accordion className="mt-12 w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
