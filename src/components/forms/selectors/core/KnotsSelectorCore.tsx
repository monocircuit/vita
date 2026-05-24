"use client";

import { type ComponentProps, useEffect, useMemo } from "react";

import { KnotsInput } from "@monocircuit/monolithium/components";
import { TanstackFieldApi } from "../types";

export type KnotsSelectorProps = ComponentProps<typeof KnotsInput>;

function toStrictlyIncreasingKnots(values: number[]): number[] {
  const finiteValues = values.filter(value => Number.isFinite(value));
  const sorted = [...finiteValues].sort((a, b) => a - b);
  const unique: number[] = [];

  for (const value of sorted) {
    if (unique.length === 0 || unique[unique.length - 1] !== value) {
      unique.push(value);
    }
  }

  return unique;
}

function sameKnots(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default function KnotsSelectorCore(props: KnotsSelectorProps) {
  const field = (props as { field?: TanstackFieldApi<number[]> }).field;
  const hasField = typeof field?.name === "string";

  const externalOnChange = hasField
    ? undefined
    : (props as { onChange: (value: number[]) => void }).onChange;

  const value = useMemo(() => {
    if (hasField) {
      return Array.isArray(field.state.value) ? field.state.value : [];
    }

    const externalValue = (props as { value?: number[] }).value;
    return Array.isArray(externalValue) ? externalValue : [];
  }, [field, hasField, props]);

  const applyNormalizedValue = (next: number[]) => {
    const normalized = toStrictlyIncreasingKnots(next);

    if (hasField) {
      field.handleChange(normalized);
      return;
    }

    externalOnChange?.(normalized);
  };

  useEffect(() => {
    const normalized = toStrictlyIncreasingKnots(value);
    if (!sameKnots(value, normalized)) {
      if (hasField) {
        field.handleChange(normalized);
        return;
      }

      externalOnChange?.(normalized);
    }
  }, [externalOnChange, field, hasField, value]);

  if (hasField) {
    const fieldProps = props as Omit<
      KnotsSelectorProps,
      "name" | "value" | "onChange" | "error"
    >;

    return (
      <KnotsInput
        {...fieldProps}
        field={{
          ...field,
          handleChange: applyNormalizedValue,
        }}
      />
    );
  }

  const nonFieldProps = props as Omit<KnotsSelectorProps, "field">;

  return (
    <KnotsInput
      {...nonFieldProps}
      value={value}
      onChange={applyNormalizedValue}
    />
  );
}
