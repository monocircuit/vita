"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chip,
  Flap,
  Popover,
  PulsatingDot,
  RelativeMouseCoordiantes,
} from "@monocircuit/monolithium/components";
import arrowIcon from "@/assets/images/png/sharp_line/Tailless-Line-Arrow-Right-1--Streamline-Sharp.png";
import { useChronicleDetail } from "./ChronicleDetailContext";
import type { Entity } from "../../../../electron/db/schema";
import { EntitySelector } from "@/components/forms/selectors";
import {
  useLinkChronicleEntities,
  useCreateEntity,
  useEntitiesReader,
} from "@/shared/data/local";
import useOwnProfileReader from "@/shared/data/tables/profiles/read/useOwnProfileReader";

// ─── Helpers (duplicated from ChronicleBox to keep the panel self-contained) ──

function formatDateTime(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  }
  return null;
}

function toTitleCaseLabel(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) return "-";
  return value
    .trim()
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function readFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function getEntitySummary(entity: Entity) {
  const record = entity as Record<string, unknown>;
  const companyName =
    readFirstString(record, ["name", "companyName", "company_name"]) ?? "Unknown Company";
  const domain = readFirstString(record, ["domain"]);
  const avatar = readFirstString(record, ["avatar", "logo", "logoUrl", "logo_url"]);
  const jobTitle =
    readFirstString(record, ["jobTitle", "job_title", "role", "position", "title"]) ?? "-";
  return { avatar, companyName, domain, jobTitle };
}

function readCategoryLabels(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map(entry => toTitleCaseLabel(entry))
      .filter(label => label && label !== "-");
  }

  const label = toTitleCaseLabel(value);
  return label && label !== "-" ? [label] : [];
}

function EntityIcon({ entity, size = 20 }: { entity: Entity; size?: number }) {
  const [hasImageFailed, setHasImageFailed] = useState(false);
  const { avatar, companyName, domain } = getEntitySummary(entity);

  const iconUrl = useMemo(() => {
    if (domain) return `/api/logo/image/${encodeURIComponent(domain)}?size=48&format=webp&retina=true`;
    return avatar;
  }, [avatar, domain]);

  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="shrink-0 border-(length:--stroke) border-solid border-border overflow-hidden flex items-center justify-center text-[10px] text-fg/80 bg-bg"
      style={{ width: size, height: size }}
    >
      {iconUrl && !hasImageFailed ? (
        <Image
          src={iconUrl}
          alt={`${companyName} logo`}
          className="w-full h-full object-cover"
          width={size}
          height={size}
          unoptimized
          onError={() => setHasImageFailed(true)}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}

function EntityBadge({ entity }: { entity: Entity }) {
  const { companyName, jobTitle } = getEntitySummary(entity);
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b-(length:--stroke) border-solid border-border">
      <EntityIcon entity={entity} size={20} />
      <div className="min-w-0">
        <div className="text-[10px] leading-tight text-fg truncate">{companyName}</div>
        {jobTitle && jobTitle !== "-" ? (
          <div className="text-[10px] leading-tight text-fg/50 truncate">{jobTitle}</div>
        ) : null}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-1.5 border-b-(length:--stroke) border-solid border-border text-[10px]">
      <span className="text-fg/50 uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-fg/80 text-right">{value}</span>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function ChronicleDetailPanel() {
  const { detail, isOpen, closeDetail } = useChronicleDetail();
  const linkEntities = useLinkChronicleEntities();
  const createEntity = useCreateEntity();
  const { data: allEntities } = useEntitiesReader();
  const { data: ownProfile } = useOwnProfileReader();

  // Keep last detail visible during close animation
  const [displayedDetail, setDisplayedDetail] = useState(detail);
  const [selectedEntityValue, setSelectedEntityValue] = useState("");
  const [isLinkingEntity, setIsLinkingEntity] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [localLinkedEntities, setLocalLinkedEntities] = useState<
    Entity[] | null
  >(null);
  const [isScopePopoverOpen, setIsScopePopoverOpen] = useState(false);
  const [isScopeFlapHovering, setIsScopeFlapHovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isOpen && detail) {
      setDisplayedDetail(detail);
    } else {
      timerRef.current = setTimeout(() => setDisplayedDetail(null), 300);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, detail]);

  useEffect(() => {
    setLocalLinkedEntities(null);
    setSelectedEntityValue("");
    setLinkError(null);
    setIsScopePopoverOpen(false);
    setIsScopeFlapHovering(false);
  }, [displayedDetail?.chronicle]);

  useEffect(() => {
    if (!isOpen) setIsScopePopoverOpen(false);
  }, [isOpen]);

  const chronicle = displayedDetail?.chronicle;
  const linkedEntities = localLinkedEntities ?? displayedDetail?.linkedEntities ?? [];
  const chronicleRecord = chronicle as Record<string, unknown> | undefined;

  const title =
    typeof chronicleRecord?.title === "string" && chronicleRecord.title.trim().length > 0
      ? chronicleRecord.title.trim()
      : "Chronicle";

  const knots = Array.isArray(chronicleRecord?.knots)
    ? chronicleRecord.knots.filter(
        (k): k is number => typeof k === "number" && Number.isFinite(k),
      )
    : [];

  const categories = readCategoryLabels(chronicleRecord?.category);
  const scopeLabel = toTitleCaseLabel(chronicleRecord?.scope);
  const description = chronicleRecord
    ? readFirstString(chronicleRecord, ["description"])
    : null;
  const chronicleId =
    typeof chronicleRecord?.id === "number" && Number.isFinite(chronicleRecord.id)
      ? chronicleRecord.id
      : null;

  const entityOptions = Array.isArray(allEntities)
    ? allEntities
    : allEntities
      ? [allEntities]
      : [];

  const linkField = {
    name: "entity-link-selector",
    state: {
      value: selectedEntityValue ? [selectedEntityValue] : [],
    },
    handleBlur: () => undefined,
    handleChange: (value: string[]) => {
      const first = Array.isArray(value) ? value[0] ?? "" : "";
      setSelectedEntityValue(first);
      setLinkError(null);

      if (first && first !== selectedEntityValue && !isLinkingEntity) {
        void handleLinkEntity(first);
      }
    },
  };

  const handleLinkEntity = async (entityValue: string) => {
    if (!chronicleId || !entityValue || isLinkingEntity) return;

    setIsLinkingEntity(true);
    setLinkError(null);

    try {
      let resolvedEntityId: number | null = null;
      let resolvedEntityRow: Entity | null = null;

      const numericCandidate = Number(entityValue);
      if (Number.isFinite(numericCandidate)) {
        const existing = entityOptions.find(e => e.id === numericCandidate);
        if (existing) {
          resolvedEntityId = numericCandidate;
          resolvedEntityRow = existing;
        }
      }

      if (!resolvedEntityId) {
        const created = await createEntity.mutateAsync({
          name: entityValue,
          address: null,
        });
        if (!created?.id) throw new Error("Failed to create entity.");
        resolvedEntityId = created.id;
        resolvedEntityRow = created;
      }

      await linkEntities.mutateAsync({
        chronicleId,
        entityIds: [resolvedEntityId],
      });

      const nextLinkedEntity =
        resolvedEntityRow ??
        entityOptions.find(e => e.id === resolvedEntityId) ??
        null;

      if (nextLinkedEntity) {
        setLocalLinkedEntities(previous => {
          const current =
            previous ?? displayedDetail?.linkedEntities ?? [];
          const alreadyLinked = current.some(e => e.id === nextLinkedEntity.id);
          if (alreadyLinked) return current;
          return [nextLinkedEntity, ...current];
        });
      }

      setSelectedEntityValue("");
    } catch (error) {
      setLinkError(
        error instanceof Error ? error.message : "Failed to link entity.",
      );
    } finally {
      setIsLinkingEntity(false);
    }
  };

  return (
    <>
      {/* Close Lasche — left edge of panel, extends left onto the canvas.
          w-6 + -ml-6 = 24px wide, 0px flex contribution.
          Mirrored curve opens to the left. Arrow points right (inward). */}
      {isOpen ? (
        <div className="shrink-0 w-6 -ml-6 h-full relative flex items-center justify-center pointer-events-none z-10">
          <svg
            className="absolute top-1/2 -translate-y-1/2 w-full"
            viewBox="0 0 24 80"
            style={{ height: "80px" }}
          >
            <g className="cursor-pointer group/detail-close" onClick={closeDetail}>
              <path
                d="M 24,0 C 24,20 0,20 0,40 C 0,60 24,60 24,80 Z"
                className="text-fg/10 group-hover/detail-close:text-fg/25 transition-colors"
                fill="currentColor"
                style={{ pointerEvents: "fill" }}
              />
            </g>
          </svg>
          {/* Arrow pointing right (into the panel = inward) */}
          <div
            className="absolute w-3 h-3 pointer-events-none bg-fg/50"
            style={{
              maskImage: `url(${arrowIcon.src})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        </div>
      ) : null}

      {/* Panel */}
      <div
        className={`h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${isOpen ? "w-[300px]" : "w-0"}`}
      >
        <aside
          className={`w-[300px] h-full flex flex-col border-l-(length:--stroke) border-solid border-border transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="shrink-0 w-full bg-surface/60">
            <Popover
              content={
                <div className="px-2 py-1.5 text-[10px] text-fg/80 uppercase tracking-wide">
                  Scope: {scopeLabel}
                </div>
              }
              className="monolithium-border bg-bg min-w-[120px]"
              shouldRender={isScopePopoverOpen}
              onClose={() => setIsScopePopoverOpen(false)}
              config={{
                isConnected: true,
                isClosableByEmptyClick: true,
                withoutHeader: true,
              }}
            >
              <div className="h-[12px] w-full border-b-(length:--stroke) border-solid border-border/50 overflow-hidden">
                <RelativeMouseCoordiantes>
                  <div
                    role="button"
                    tabIndex={0}
                    className="size-full relative overlay cursor-pointer select-none"
                    onMouseEnter={() => setIsScopeFlapHovering(true)}
                    onMouseLeave={() => setIsScopeFlapHovering(false)}
                    onClick={() => setIsScopePopoverOpen(previous => !previous)}
                    onKeyDown={event => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setIsScopePopoverOpen(previous => !previous);
                      }
                    }}
                  >
                    <div className="attach z-0 bg-bg/80" />
                    <Flap
                      className="attach z-1"
                      classNameObject="bg-accent opacity-25"
                      isActive={isScopePopoverOpen || isScopeFlapHovering}
                      centerFallback
                    />
                    <div className="attach z-2 flex items-center justify-center gap-1 text-[8px] uppercase tracking-wide text-fg leading-none pointer-events-none">
                      <PulsatingDot />
                      <span>{scopeLabel}</span>
                    </div>
                  </div>
                </RelativeMouseCoordiantes>
              </div>
            </Popover>
          </div>

          {/* Unified header: entity icons (or + button) + title + category */}
          <div className="shrink-0 border-b-(length:--stroke) border-solid border-border bg-surface/60">
            <div className="px-3 py-2">
              <div className="flex items-start gap-2 min-w-0">
                {/* Entity icons or add-entity placeholder */}
                <div className="shrink-0 flex flex-col gap-1">
                  {linkedEntities.length > 0 ? (
                    linkedEntities.map((entity, index) => (
                      <EntityIcon
                        key={String(
                          (entity as Record<string, unknown>).id ??
                            `${(entity as Record<string, unknown>).domain ?? "entity"}-${index}`,
                        )}
                        entity={entity}
                        size={24}
                      />
                    ))
                  ) : (
                    <div className="relative shrink-0" style={{ width: 24, height: 24 }}>
                      <EntitySelector
                        field={linkField}
                        maxSelected={1}
                        showCounter={false}
                        placeholder=""
                        wrapperClassName="w-full h-full"
                        className="!w-full !h-full !min-h-0 !border-dashed !border-border/60 hover:!border-border [&>div]:!hidden"
                        disabled={isLinkingEntity}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-fg/40">
                        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" aria-hidden>
                          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      {linkError ? (
                        <div className="absolute top-full left-0 mt-1 text-[10px] text-destructive truncate whitespace-nowrap">{linkError}</div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Title + ID */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <span className="flex-1 text-sm text-fg leading-snug wrap-break-word">
                      {title}
                    </span>
                    {typeof chronicleRecord?.id === "number" ? (
                      <span className="text-[10px] text-fg/40 shrink-0 mt-0.5">
                        #{chronicleRecord.id}
                      </span>
                    ) : null}
                  </div>

                  {categories.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {categories.map(category => (
                        <Chip
                          key={category}
                          text={category}
                          className="text-[9px] uppercase tracking-wide text-fg/75"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

          </div>

          {/* Scrollable content */}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            <div className="px-3 py-2 border-b-(length:--stroke) border-solid border-border">
              <div className="text-[10px] uppercase tracking-wide text-fg/50">Description</div>
              <p className="mt-1 text-[10px] text-fg/80 whitespace-pre-wrap break-words leading-relaxed">
                {description ?? "-"}
              </p>
            </div>

            <div className="flex flex-col">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-fg/40 border-b-(length:--stroke) border-t-(length:--stroke) border-solid border-border">
                Projects
              </div>
              {linkedEntities.length > 0 ? (
                linkedEntities.map((entity, index) => (
                  <EntityBadge
                    key={String(
                      (entity as Record<string, unknown>).id ??
                        `${(entity as Record<string, unknown>).domain ?? "entity"}-${index}`,
                    )}
                    entity={entity}
                  />
                ))
              ) : (
                <div className="px-3 py-1.5 text-[10px] text-fg/50 border-b-(length:--stroke) border-solid border-border">
                  -
                </div>
              )}
            </div>

            {knots.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-fg/40 border-b-(length:--stroke) border-t-(length:--stroke) border-solid border-border">
                  Knots
                </div>
                {knots.map((knot, index) => (
                  <div
                    key={`${knot}-${index}`}
                    className="px-3 py-1.5 text-[10px] text-fg/70 border-b-(length:--stroke) border-solid border-border"
                  >
                    {formatDateTime(knot) ?? String(knot)}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-auto border-t-(length:--stroke) border-solid border-border">
              <DetailRow
                label="Created"
                value={
                  formatDateTime(chronicleRecord?.createdAt ?? chronicleRecord?.created_at) ??
                  "-"
                }
              />
              <DetailRow
                label="Updated"
                value={
                  formatDateTime(chronicleRecord?.updatedAt ?? chronicleRecord?.updated_at) ??
                  "-"
                }
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
