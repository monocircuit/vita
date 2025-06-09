import { Profile } from "@/utils/schemas/Profile";
import { createClient } from "../../client";
import useSWR from "swr";

export async function getOwnProfile() {
  const supabase = createClient();

  console.log("fetch own profile");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  return {
    /**
     * Maps the profile fields to the Profile schema.
     */
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url,
    dayOfBirth: profile.day_of_birth,
    maritalStatus: profile.marital_status,
  } as Profile;
}

export const useOwnProfileData = () => {
  const { data, error, isLoading } = useSWR("own_profile", getOwnProfile);

  return {
    ownProfile: data,
    ownProfileError: error,
    isOwnProfileLoading: isLoading,
  };
};
