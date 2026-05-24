"use client";

import { TanstackReader } from "@/shared/data/tanstack";

const useScope = TanstackReader.Enum.create("scope").build();

export default useScope;
