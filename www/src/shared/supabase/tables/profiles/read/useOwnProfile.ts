"use client";

import makeOwn from "@/shared/tanstack/reader/makeOwn";
import useProfileByUserId from "./useProfileByUserId";

const useOwnProfile = makeOwn(useProfileByUserId);

export default useOwnProfile;
