"use client";

import VitaForm, { VitaFormInitialValues } from "@/components/common/VitaForm/VitaForm";
import { Popover } from "@monocircuit/monolithium/components";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVitasReader, useChroniclesReader, useEntitiesReader } from "@/shared/data/local";
import PageHead from "@/components/features/dashboard/sections/PageHead";
import VitaCard from "@/components/features/dashboard/sections/VitaCard";
import { mono, pad2, relativeTime } from "@/components/features/dashboard/sections/utils";

const Vitas = () => {
  const router = useRouter();
  const { data: vitas } = useVitasReader();
  const { data: chronicles } = useChroniclesReader();
  const { data: entities } = useEntitiesReader();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VitaFormInitialValues | null>(null);

  const vitasList = vitas ?? [];
  const chroniclesTotal = chronicles?.length ?? 0;
  const entitiesTotal = entities?.length ?? 0;
  const perVitaC = Math.round(chroniclesTotal / Math.max(1, vitasList.length));
  const perVitaE = Math.round(entitiesTotal / Math.max(1, vitasList.length));

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100%" }}>
      <PageHead
        number="01"
        kicker="SECTION · VITAS"
        title="All your timelines."
        subtitle="Every Vita you maintain, with its chronicles and entities. Open one to edit, or create a new one."
        right={
          <div className="flex flex-col items-end gap-1">
            <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: "var(--color-fg)" }}>
              {pad2(vitasList.length)}
            </div>
            <div
              style={{
                ...mono,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "#606060",
              }}
            >
              Vitas · Active
            </div>
          </div>
        }
      />

      <div
        style={{ padding: "32px max(32px,5%) 48px" }}
        className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]"
      >
        {vitasList.map(v => (
          <div key={v.id} className="relative group">
            <VitaCard
              vita={v as unknown as Parameters<typeof VitaCard>[0]["vita"]}
              chronicleCount={perVitaC}
              entityCount={perVitaE}
            />
            <Popover
              content={
                <VitaForm
                  initialValues={{
                    id: v.id,
                    name: v.name,
                    scope: v.scope ?? "",
                    type: v.type,
                  }}
                  onSuccess={() => setEditTarget(null)}
                />
              }
              className="w-[300px] h-[320px] border-solid border-border border-(length:--stroke) bg-primary"
              config={{ isConnected: true, isClosableByEmptyClick: true, isDraggable: true }}
              shouldRender={editTarget?.id === v.id}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  setEditTarget(
                    editTarget?.id === v.id
                      ? null
                      : { id: v.id, name: v.name, scope: v.scope ?? "", type: v.type },
                  );
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  ...mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  padding: "4px 8px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                Edit
              </button>
            </Popover>
            <div
              style={{
                ...mono,
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#606060",
                padding: "8px 4px 0",
              }}
            >
              Created {relativeTime(v.createdAt)}
            </div>
          </div>
        ))}

        <Popover
          content={
            <VitaForm
              onSuccess={(vita) => {
                setIsCreateOpen(false);
                if (vita) {
                  router.push(`/editor/${vita.id}`);
                }
              }}
            />
          }
          className="w-[300px] h-[320px] border-solid border-border border-(length:--stroke) bg-primary"
          config={{ isConnected: true, isClosableByEmptyClick: true, isDraggable: true }}
          shouldRender={isCreateOpen}
        >
          <button
            onClick={() => setIsCreateOpen(v => !v)}
            className="flex flex-col items-center justify-center gap-3 transition-colors w-full"
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
        </Popover>
      </div>

      {vitasList.length === 0 && (
        <div
          style={{
            ...mono,
            fontSize: 11,
            color: "#606060",
            padding: "0 max(32px,5%) 48px",
          }}
        >
          No vitas yet. Start by creating one.
        </div>
      )}
    </div>
  );
};

export default Vitas;
