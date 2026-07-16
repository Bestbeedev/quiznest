import { FAQ_ITEMS } from "@/constants/marketing";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/shared/reveal";

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
      <Reveal className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Questions fréquentes</h2>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <Accordion>
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
