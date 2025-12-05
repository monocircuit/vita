"use client";

import makeOwn from "@/shared/tanstack/reader/makeOwn";
import useChroniclesByUserId from "./useChroniclesByUserId";

const useOwnChronicles = makeOwn(useChroniclesByUserId);

export default useOwnChronicles;
