import { ArchitectureDiagram } from "./ArchitectureDiagram";

export function MissionSection() {
  return (
    <section id="mission" className="border-b border-zinc-200/80 bg-[#fafafa] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="tr-section-label">Our mission</p>
            <h2 className="tr-headline mt-2 text-2xl sm:text-3xl">
              Every agent action should leave a receipt.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-zinc-600">
              <p>
                AI is moving from chat to autonomous workflows — drafting content, touching
                customers, and acting inside your stack. The accountability layer hasn&apos;t
                caught up. Teams are asked to &ldquo;trust the model&rdquo; with nothing
                portable to show legal, security, or the customer who received the output.
              </p>
              <p>
                We built Trust Receipt for the people who have to answer when something goes
                wrong: the compliance lead reviewing a launch, the marketer who owns the brand,
                the engineer wiring agents into production. You deserve proof you can hand
                someone — not a screenshot.
              </p>
              <p className="font-medium text-zinc-800">
                Runtime trust that sits beside your agents, verifies every step, and signs a
                receipt anyone can validate offline.
              </p>
            </div>
          </div>
          <div className="tr-card overflow-hidden p-4 sm:p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
              How it fits your stack
            </p>
            <ArchitectureDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
