import { useMemo, useState } from "react";
import deleteIcon from "@/assets/images/png/sharp_line/delete.png";
import { Chip, Dialog } from "@monocircuit/monolithium/components";
import { useChronicleDetail } from "@/components/features/editor/ChronicleDetailContext";
import type { ChronicleView } from '@/shared/data/db';
import type { Entity } from '@/shared/data/db';
import { useLogoImage } from "@/shared/logo";

interface ChronicleBoxProps {
  chronicle?: ChronicleView;
  linkedEntities?: Entity[];
  fallbackChronicleId?: string;
  onDeleteChronicle?: (chronicleId: number) => void | Promise<void>;
  onDismiss?: () => void;
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
    if (typeof value === "string" && value.trim().length > 0)
      return value.trim();
  }
  return null;
}

function getEntitySummary(entity: Entity) {
  const record = entity as Record<string, unknown>;
  const companyName =
    readFirstString(record, ["name", "companyName", "company_name"]) ??
    "Unknown Company";
  const domain = readFirstString(record, ["domain"]);
  const avatar = readFirstString(record, [
    "avatar",
    "logo",
    "logoUrl",
    "logo_url",
  ]);
  const jobTitle =
    readFirstString(record, [
      "jobTitle",
      "job_title",
      "role",
      "position",
      "title",
    ]) ?? "-";
  return { avatar, companyName, domain, jobTitle };
}

function EntityIcon({
  entity,
  size = 32,
}: {
  entity: Entity;
  size?: number;
}) {
  const [hasImageFailed, setHasImageFailed] = useState(false);
  const { avatar, companyName } = getEntitySummary(entity);

  const { data: logo } = useLogoImage(companyName);
  const iconUrl = useMemo(() => {
    if (logo?.svg) return `data:image/svg+xml;utf8,${encodeURIComponent(logo.svg)}`;
    if (logo?.imageUrl) return logo.imageUrl;
    return avatar;
  }, [avatar, logo]);

  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="shrink-0 border-(length:--stroke) border-solid border-border overflow-hidden flex items-center justify-center text-[11px] text-fg/80 bg-bg"
      style={{ width: size, height: size }}
    >
      {iconUrl && !hasImageFailed ? (
        <img
          src={iconUrl}
          alt={`${companyName} logo`}
          className="w-full h-full object-cover"
          width={size}
          height={size}
          onError={() => setHasImageFailed(true)}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}

export default function ChronicleBox({
  chronicle,
  linkedEntities = [],
  fallbackChronicleId,
  onDeleteChronicle,
  onDismiss,
}: ChronicleBoxProps) {
  const { openDetail } = useChronicleDetail();
  const [isDeletingChronicle, setIsDeletingChronicle] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const chronicleRecord = chronicle as Record<string, unknown> | undefined;

  const title =
    typeof chronicleRecord?.title === "string" &&
    chronicleRecord.title.trim().length > 0
      ? chronicleRecord.title.trim()
      : `Chronicle ${fallbackChronicleId ?? ""}`.trim();

  const description =
    typeof chronicleRecord?.description === "string"
      ? chronicleRecord.description.trim()
      : "";

  const category = toTitleCaseLabel(chronicleRecord?.category);
  const chronicleId =
    typeof chronicleRecord?.id === "number" &&
    Number.isFinite(chronicleRecord.id)
      ? chronicleRecord.id
      : null;

  const handleDeleteChronicle = async () => {
    if (!chronicleId || !onDeleteChronicle || isDeletingChronicle) return;

    setIsDeletingChronicle(true);
    try {
      await onDeleteChronicle(chronicleId);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeletingChronicle(false);
    }
  };

  return (
    <div
      className="flex flex-row pointer-events-auto"
      onClick={e => e.stopPropagation()}
    >
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Chronicle löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden."
        cancelText="Abbrechen"
        confirmText="Löschen"
        variant="danger"
        isBusy={isDeletingChronicle}
        isConfirmDisabled={!chronicleId || !onDeleteChronicle}
        onConfirm={handleDeleteChronicle}
      />

      {/* Remove Lasche — left side */}
      {chronicleId && onDeleteChronicle ? (
        <div className="shrink-0 w-6 -ml-6 self-stretch relative pointer-events-none z-10">
          <svg
            className="absolute top-1/2 -translate-y-1/2 w-full"
            viewBox="0 0 24 80"
            style={{ height: "80px" }}
          >
            <g
              className="cursor-pointer group/delete"
              onClick={() => {
                setIsDeleteDialogOpen(true);
              }}
            >
              <path
                d="M 24,0 C 24,20 0,20 0,40 C 0,60 24,60 24,80 Z"
                className="text-error/20 group-hover/delete:text-error/40 transition-colors"
                fill="currentColor"
                style={{ pointerEvents: "fill" }}
              />
            </g>
          </svg>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none bg-error"
            style={{
              maskImage: `url(${deleteIcon})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        </div>
      ) : null}

      {/* Main popover */}
      <div className="w-[260px] bg-bg border-(length:--stroke) border-solid border-border flex flex-col">
        {/* Header: company icon + title + entity info */}
        <div className="flex items-center gap-2 p-2.5 border-b-(length:--stroke) border-solid border-border">
          {linkedEntities.length > 0 ? (
            <div className="shrink-0 flex flex-row flex-wrap gap-1 max-w-[84px]">
              {linkedEntities.map((entity, index) => (
                <EntityIcon
                  key={String(
                    (entity as Record<string, unknown>).id ??
                      `${(entity as Record<string, unknown>).domain ?? "entity"}-${index}`,
                  )}
                  entity={entity}
                  size={24}
                />
              ))}
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-fg leading-tight wrap-break-word">
              {title}
            </h3>
          </div>
          {typeof chronicleRecord?.id === "number" ? (
            <span className="text-[10px] text-fg/40 shrink-0">
              #{chronicleRecord.id}
            </span>
          ) : null}
        </div>

        {/* Category */}
        {category && category !== "-" ? (
          <div className="px-2.5 py-1 border-b-(length:--stroke) border-solid border-border">
            <Chip
              text={category}
              className="text-[9px] uppercase tracking-wide text-fg/75"
            />
          </div>
        ) : null}

        {/* Description */}
        {description ? (
          <p className="px-2.5 py-1.5 text-xs text-fg/80 leading-snug whitespace-pre-wrap wrap-break-word border-b-(length:--stroke) border-solid border-border">
            {description}
          </p>
        ) : null}

        {/* Show details — opens right panel */}
        <button
          type="button"
          className="px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-fg/60 hover:text-fg hover:bg-secondary/5 text-left transition-colors"
          onClick={() => {
            openDetail(chronicle, linkedEntities);
            onDismiss?.();
          }}
        >
          Show details
        </button>
      </div>

      {/* Edit Lasche — right side */}
      {chronicleId ? (
        <div className="shrink-0 w-6 -mr-6 self-stretch relative pointer-events-none z-10">
          <svg
            className="absolute top-1/2 -translate-y-1/2 w-full"
            viewBox="0 0 24 80"
            style={{ height: "80px" }}
          >
            <g
              className="cursor-pointer group/edit"
              onClick={() => {
                openDetail(chronicle, linkedEntities);
                onDismiss?.();
              }}
            >
              <path
                d="M 0,0 C 0,20 24,20 24,40 C 24,60 0,60 0,80 Z"
                className="text-accent/20 group-hover/edit:text-accent/45 transition-colors"
                fill="currentColor"
                style={{ pointerEvents: "fill" }}
              />
            </g>
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-accent">
            <svg
              viewBox="0 0 16 16"
              className="w-3 h-3"
              fill="none"
              aria-hidden
            >
              <path
                d="M11.8 2.2a1.6 1.6 0 1 1 2.3 2.3L6 12.6 2.8 13.2 3.4 10l8.4-7.8Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="m9.9 4.1 2 2" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </div>
        </div>
      ) : null}
    </div>
  );
}
