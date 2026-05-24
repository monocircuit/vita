"use client";

import { useEffect, useMemo, useState } from "react";
import { MultiSelect } from "@monocircuit/monolithium/components";
import { EntitySelectorProps } from "../types";

interface LogoDevEntityResult {
  name: string;
  domain: string;
  description?: string;
  logo?: string;
  colors?: Array<{ r?: number; g?: number; b?: number; hex: string }>;
}

interface LogoDevSearchResult {
  name: string;
  domain: string;
}

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

function toEntityOption(result: LogoDevEntityResult): EntityOption {
  const domain = result.domain.trim();
  const name = result.name.trim() || domain;
  const primaryColor = result.colors?.find(c => typeof c.hex === "string")?.hex;

  return {
    label: name,
    value: domain,
    name,
    domain,
    description: result.description,
    logoUrl: result.logo,
    logoAlt: `${name} logo`,
    highlightColor: primaryColor,
    showMonogramFallback: true,
  };
}

async function fetchEntitySearchResults(query: string, signal: AbortSignal) {
  const response = await fetch(
    `/api/logo/search?q=${encodeURIComponent(query)}&strategy=typeahead`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("logo.dev search failed");
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) return [] as LogoDevSearchResult[];

  return payload
    .map(item => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Partial<LogoDevSearchResult>;
      if (typeof candidate.domain !== "string") return null;

      return {
        name:
          typeof candidate.name === "string"
            ? candidate.name
            : candidate.domain,
        domain: candidate.domain,
      };
    })
    .filter((item): item is LogoDevSearchResult => item !== null);
}

async function fetchEntityDescribeResult(
  domain: string,
  signal: AbortSignal,
): Promise<Partial<LogoDevEntityResult> | undefined> {
  const response = await fetch(
    `/api/logo/describe/${encodeURIComponent(domain)}`,
    {
      signal,
    },
  );

  if (!response.ok) return undefined;

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") return undefined;

  const describe = payload as Partial<LogoDevEntityResult>;
  return {
    description:
      typeof describe.description === "string"
        ? describe.description
        : undefined,
    logo: typeof describe.logo === "string" ? describe.logo : undefined,
    colors: Array.isArray(describe.colors) ? describe.colors : undefined,
  };
}

async function fetchEntityOptions(query: string, signal: AbortSignal) {
  const searchResults = await fetchEntitySearchResults(query, signal);

  return searchResults.map(result =>
    toEntityOption({
      name: result.name,
      domain: result.domain,
    }),
  );
}

const EntitySelectorCore: React.FC<EntitySelectorProps> = props => {
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
    } else if (
      query.trim().length > 0 &&
      query.trim().length < MIN_QUERY_LENGTH
    ) {
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
  }, [
    isEnriching,
    isSearching,
    knownOptions,
    loadError,
    query,
    results,
    selectedValues,
  ]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setLoadError(undefined);
      setIsSearching(false);
      setIsEnriching(false);
      return;
    }

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
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
        .then(nextResults => {
          if (controller.signal.aborted) return;

          setResults(nextResults);
          setKnownOptions(previous => {
            const next = new Map(previous);
            nextResults.forEach(option => next.set(option.value, option));
            return next;
          });

          const toEnrich = nextResults.slice(0, ENRICH_LIMIT);
          if (toEnrich.length === 0) return;

          setIsEnriching(true);
          void Promise.all(
            toEnrich.map(async option => {
              const describe = await fetchEntityDescribeResult(
                option.domain,
                controller.signal,
              );

              if (!describe) return null;

              return toEntityOption({
                name: option.name,
                domain: option.domain,
                description: describe.description,
                logo: describe.logo,
                colors: describe.colors,
              });
            }),
          )
            .then(enrichedOptions => {
              if (controller.signal.aborted) return;

              const validEnriched = enrichedOptions.filter(
                (option): option is EntityOption => option !== null,
              );
              if (validEnriched.length === 0) return;

              const enrichedByDomain = new Map(
                validEnriched.map(option => [option.domain, option] as const),
              );

              setResults(previous =>
                previous.map(
                  option => enrichedByDomain.get(option.domain) ?? option,
                ),
              );

              setKnownOptions(previous => {
                const next = new Map(previous);
                validEnriched.forEach(option => next.set(option.value, option));
                return next;
              });
            })
            .finally(() => {
              if (controller.signal.aborted) return;
              setIsEnriching(false);
            });
        })
        .catch(error => {
          if (controller.signal.aborted) return;
          setResults([]);
          setLoadError(
            error instanceof Error ? error.message : "Search failed",
          );
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
        [props.triggerClassName, props.anchorClassName]
          .filter(Boolean)
          .join(" ") || undefined
      }
      disabled={props.disabled}
      maxSelected={props.maxSelected}
      showCounter={props.showCounter}
      onSearchQueryChange={setQuery}
      filterFn={() => true}
      renderOption={(option, _selected) => {
        const entityDomain = (option as { domain?: string }).domain;

        return (
          <div className="min-w-0 flex-1">
            <div className="truncate">{option.label}</div>
            {entityDomain ? (
              <div className="truncate text-xs opacity-60">{entityDomain}</div>
            ) : null}
            {isSearching && query.trim() ? (
              <div className="truncate text-xs opacity-60">
                Searching logo.dev...
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
};

export default EntitySelectorCore;
