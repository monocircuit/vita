"use client";

import makeOwn from "@/shared/data/tanstack";
import useProfileByUserIdReader from "./useProfileByUserIdReader";

const useOwnProfileReader = makeOwn(useProfileByUserIdReader);

export default useOwnProfileReader;
