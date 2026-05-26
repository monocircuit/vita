import { useNavigate } from "@tanstack/react-router";
import { useVitasReader, useChroniclesReader, useEntitiesReader } from "@/shared/data/local";
import SectionHead from "./SectionHead";
import VitaCard from "./VitaCard";
import { mono, pad2 } from "./utils";

const VitasSection = () => {
  const navigate = useNavigate();
  const { data: vitas } = useVitasReader();
  const { data: chronicles } = useChroniclesReader();
  const { data: entities } = useEntitiesReader();

  const vitasList = vitas ?? [];
  const chroniclesTotal = chronicles?.length ?? 0;
  const entityTotal = entities?.length ?? 0;

  return (
    <section
      id="sec-vitas"
      style={{ background: "var(--color-bg)", position: "relative" }}
    >
      <SectionHead
        number="01"
        kicker="SECTION · VITAS"
        title="Your timelines."
        metaValue={pad2(vitasList.length)}
        metaLabel="Vitas · Active"
      />

      <div
        style={{ padding: "32px max(32px,5%) 48px" }}
        className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]"
      >
        {vitasList.map(v => (
          <VitaCard
            key={v.id}
            vita={v as unknown as Parameters<typeof VitaCard>[0]["vita"]}
            chronicleCount={Math.round(chroniclesTotal / Math.max(1, vitasList.length))}
            entityCount={Math.round(entityTotal / Math.max(1, vitasList.length))}
          />
        ))}

        <button
          onClick={() => navigate({ to: "/dashboard/vitas" })}
          className="flex flex-col items-center justify-center gap-3 transition-colors"
          style={{
            border: "1px dashed rgba(255,255,255,0.18)",
            background: "transparent",
            minHeight: 240,
            color: "#606060",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--color-accent)";
            e.currentTarget.style.color = "var(--color-accent)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            e.currentTarget.style.color = "#606060";
          }}
        >
          <span style={{ ...mono, fontSize: 28 }}>+</span>
          <span
            style={{
              ...mono,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
            }}
          >
            New Vita
          </span>
        </button>
      </div>
    </section>
  );
};

export default VitasSection;
