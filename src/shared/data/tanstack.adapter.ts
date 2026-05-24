import {
  configureTanstackAdapter,
  type TanstackAdapter,
  type TanstackClientLike,
} from "@/vendor/tanstack";

type SupabaseLikeClient = TanstackClientLike & {
  auth?: {
    getUser?: () => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
    onAuthStateChange?: (
      callback: (
        event: string,
        session: { user?: { id: string } } | null,
      ) => void,
    ) => { data: { subscription: { unsubscribe: () => void } } };
  };
};

const supabaseAdapter: TanstackAdapter = {
  getUser: async (client: TanstackClientLike) => {
    const supabase = client as SupabaseLikeClient;
    const auth = supabase.auth;

    if (!auth?.getUser) {
      throw new Error(
        "Tanstack Supabase adapter: client.auth.getUser is missing.",
      );
    }

    const {
      data: { user },
      error,
    } = await auth.getUser();

    return {
      user: user ? { id: user.id } : null,
      error,
    };
  },
  onAuthStateChange: (
    client: TanstackClientLike,
    callback: (event: string, user: { id: string } | null) => void,
  ) => {
    const supabase = client as SupabaseLikeClient;
    const auth = supabase.auth;

    if (!auth?.onAuthStateChange) {
      return () => {};
    }

    const {
      data: { subscription },
    } = auth.onAuthStateChange((event: string, session) => {
      callback(event, session?.user?.id ? { id: session.user.id } : null);
    });

    return () => {
      subscription.unsubscribe();
    };
  },
};

configureTanstackAdapter(supabaseAdapter);
