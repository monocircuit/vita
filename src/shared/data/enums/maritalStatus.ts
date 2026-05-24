"use client";

import { TanstackReader } from "@/shared/data/tanstack";

const useMaritalStatus = TanstackReader.Enum.create("maritalStatus").build();

export default useMaritalStatus;
