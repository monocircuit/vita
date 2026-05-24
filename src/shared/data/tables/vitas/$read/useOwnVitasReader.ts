"use client";

import makeOwn from "@/shared/data/tanstack";
import useVitasByUserIdReader from "./useVitasByUserIdReader";

const useOwnVitasReader = makeOwn(useVitasByUserIdReader);

export default useOwnVitasReader;
