"use client";

import makeOwn from "@/shared/tanstack/reader/makeOwn";
import useVitasByUserId from "./useVitasByUserId";

const useOwnVitas = makeOwn(useVitasByUserId);

export default useOwnVitas;
