import { useMemo } from 'react';

const SCOPES = ['private', 'public', 'restricted'] as const;
const CHRONICLE_CATEGORIES = [
  'work experience',
  'education',
  'internship',
  'volunteering',
  'hobby',
] as const;
const CHRONICLE_ORIENTATIONS = ['above', 'below', 'neutral'] as const;
const MARITAL_STATUSES = [
  'single',
  'married',
  'divorced',
  'widowed',
  'separated',
  'partnered',
] as const;

export function useScopes() {
  return useMemo(() => ({ data: [...SCOPES], isLoading: false }), []);
}

export function useChronicleCategories() {
  return useMemo(() => ({ data: [...CHRONICLE_CATEGORIES], isLoading: false }), []);
}

export function useChronicleOrientations() {
  return useMemo(() => ({ data: [...CHRONICLE_ORIENTATIONS], isLoading: false }), []);
}

export function useMaritalStatuses() {
  return useMemo(() => ({ data: [...MARITAL_STATUSES], isLoading: false }), []);
}
