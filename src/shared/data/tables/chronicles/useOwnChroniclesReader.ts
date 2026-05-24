"use client";

import makeOwn from "@/shared/data/tanstack";
import useChroniclesByUserIdReader from "./useChroniclesByUserIdReader";

const useOwnChroniclesReader = makeOwn(useChroniclesByUserIdReader);

export default useOwnChroniclesReader;
