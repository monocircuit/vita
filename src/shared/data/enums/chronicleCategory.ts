"use client";

import { TanstackReader } from "@/shared/data/tanstack";

const useChronicleCategory =
  TanstackReader.Enum.create("chronicleCategory").build();

export default useChronicleCategory;
