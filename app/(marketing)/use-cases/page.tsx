import { Container } from "@/components/ui/container";
import { UseCases } from "@/components/site/use-cases";

export default function UseCasesPage() {
  return (
    <section className="relative z-10 pt-24 lg:pt-32">
      <Container>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-[56px]">
            Use Cases
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-8 text-slate-500">
            Discover how businesses are using Tensor-Bot to transform their operations and customer experience.
          </p>
        </div>
      </Container>
      <UseCases />
    </section>
  );
}
