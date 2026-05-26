import { useEffect, useMemo, useState } from "react";
import { MultiSelect } from "@monocircuit/monolithium/components";
import {
  searchSimpleIcons,
  wikipediaSearch,
  wikipediaSummary,
  loadSimpleIconSvg,
  type SimpleIconEntry,
} from "@/shared/logo";
import { EntitySelectorProps } from "../types";

interface EntityOption {
  label: string;
  value: string;
  disabled?: boolean;
  logoUrl?: string;
  logoAlt?: string;
  highlightColor?: string;
  showMonogramFallback?: boolean;
  name: string;
  domain: string;
  description?: string;
}

const MIN_QUERY_LENGTH = 2;
const ENRICH_LIMIT = 6;

function simpleIconToOption(entry: SimpleIconEntry): EntityOption {
  return {
    label: entry.title,
    value: entry.slug,
    name: entry.title,
    domain: entry.slug,
    logoAlt: `${entry.title} logo`,
    highlightColor: `#${entry.hex}`,
    showMonogramFallback: true,
  };
}

function wikipediaToOption(title: string, description?: string): EntityOption {
  return {
    label: title,
    value: `wiki:${title}`,
    name: title,
    domain: title,
    description,
    logoAlt: `${title} logo`,
    showMonogramFallback: true,
  };
}

async function fetchEntityOptions(query: string, signal: AbortSignal): Promise<EntityOption[]> {
  const icons = searchSimpleIcons(query, 6);
  const iconResults = icons.map(simpleIconToOption);

  let wikiHits: { title: string; description?: string }[] = [];
  try {
    wikiHits = await wikipediaSearch(query, 4);
  } catch {
    wikiHits = [];
  }

  if (signal.aborted) return [];

  const wikiResults = wikiHits.map((w) => wikipediaToOption(w.title, w.description));
  return [...iconResults, ...wikiResults];
}

async function enrichEntityOption(option: EntityOption, signal: AbortSignal): Promise<EntityOption | null> {
  if (option.value.startsWith("wiki:")) {
    const title = option.name;
    const summary = await wikipediaSummary(title);
    if (signal.aborted) return null;
    if (!summary) return null;
    return {
      ...option,
      description: summary.extract || option.description,
      logoUrl: summary.thumbnail?.source,
    };
  }
  const svg = await loadSimpleIconSvg(option.value);
  if (signal.aborted) return null;
  if (!svg) return null;
  const logoUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return { ...option, logoUrl };
}

const EntitySelectorCore: React.FC<EntitySelectorProps> = (props) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<EntityOption[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [knownOptions, setKnownOptions] = useState<Map<string, EntityOption>>(
    () => new Map(),
  );

  const selectedValues = useMemo(() => {
    return Array.isArray(props.field.state.value)
      ? props.field.state.value
      : [];
  }, [props.field.state.value]);

  const options = useMemo(() => {
    const next = new Map<string, EntityOption>();

    for (const result of results) {
      next.set(result.value, result);
    }

    for (const selectedValue of selectedValues) {
      if (!next.has(selectedValue)) {
        const known = knownOptions.get(selectedValue);

        next.set(selectedValue, {
          label: known?.label ?? selectedValue,
          value: selectedValue,
          name: known?.name ?? selectedValue,
          domain: known?.domain ?? selectedValue,
          description: known?.description,
          logoUrl: known?.logoUrl,
          logoAlt: known?.logoAlt ?? `${selectedValue} logo`,
          highlightColor: known?.highlightColor,
          showMonogramFallback: known?.showMonogramFallback ?? true,
        });
      }
    }

    const merged = Array.from(next.values());

    if (loadError && query.trim().length >= MIN_QUERY_LENGTH) {
      merged.unshift({
        label: loadError,
        value: "__entity-selector-error__",
        disabled: true,
        name: loadError,
        domain: "",
      });
    } else if (query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH) {
      merged.unshift({
        label: `Type at least ${MIN_QUERY_LENGTH} characters`,
        value: "__entity-selector-hint__",
        disabled: true,
        name: "Search hint",
        domain: "",
      });
    } else if (isSearching && merged.length === 0) {
      merged.unshift({
        label: "Searching companies...",
        value: "__entity-selector-searching__",
        disabled: true,
        name: "Searching",
        domain: "",
      });
    } else if (
      query.trim().length >= MIN_QUERY_LENGTH &&
      !isSearching &&
      !loadError &&
      merged.length === 0
    ) {
      merged.unshift({
        label: "No entities found",
        value: "__entity-selector-empty__",
        disabled: true,
        name: "No results",
        domain: "",
      });
    } else if (isEnriching) {
      merged.unshift({
        label: "Loading logos and details...",
        value: "__entity-selector-enriching__",
        disabled: true,
        name: "Enriching",
        domain: "",
      });
    }

    return merged;
  }, [isEnriching, isSearching, knownOptions, loadError, query, results, selectedValues]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoadError(undefined);
      setIsSearching(false);
      setIsEnriching(false);
      return;
    }

    setLoadError(undefined);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setLoadError(undefined);

      void fetchEntityOptions(trimmedQuery, controller.signal)
        .then((nextResults) => {
          if (controller.signal.aborted) return;

          setResults(nextResults);
          setKnownOptions((previous) => {
            const next = new Map(previous);
            nextResults.forEach((option) => next.set(option.value, option));
            return next;
          });

          const toEnrich = nextResults.slice(0, ENRICH_LIMIT);
          if (toEnrich.length === 0) return;

          setIsEnriching(true);
          void Promise.all(
            toEnrich.map((option) => enrichEntityOption(option, controller.signal)),
          )
            .then((enrichedOptions) => {
              if (controller.signal.aborted) return;

              const validEnriched = enrichedOptions.filter(
                (option): option is EntityOption => option !== null,
              );
              if (validEnriched.length === 0) return;

              const enrichedByValue = new Map(
                validEnriched.map((option) => [option.value, option] as const),
              );

              setResults((previous) =>
                previous.map((option) => enrichedByValue.get(option.value) ?? option),
              );

              setKnownOptions((previous) => {
                const next = new Map(previous);
                validEnriched.forEach((option) => next.set(option.value, option));
                return next;
              });
            })
            .finally(() => {
              if (controller.signal.aborted) return;
              setIsEnriching(false);
            });
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          setResults([]);
          setLoadError(error instanceof Error ? error.message : "Search failed");
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setIsSearching(false);
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <MultiSelect
      field={props.field}
      options={options}
      label={props.label}
      placeholder={props.placeholder ?? "Search company"}
      className={props.className}
      wrapperClassName={props.wrapperClassName}
      triggerClassName={
        [props.triggerClassName, props.anchorClassName].filter(Boolean).join(" ") || undefined
      }
      disabled={props.disabled}
      maxSelected={props.maxSelected}
      showCounter={props.showCounter}
      onSearchQueryChange={setQuery}
      filterFn={() => true}
      renderOption={(option) => {
        const entityDomain = (option as { domain?: string }).domain;

        return (
          <div className="min-w-0 flex-1">
            <div className="truncate">{option.label}</div>
            {entityDomain ? (
              <div className="truncate text-xs opacity-60">{entityDomain}</div>
            ) : null}
            {isSearching && query.trim() ? (
              <div className="truncate text-xs opacity-60">Searching…</div>
            ) : null}
          </div>
        );
      }}
    />
  );
};

export default EntitySelectorCore;
