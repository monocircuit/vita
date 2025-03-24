import { redirect } from "next/navigation";
import { setCookie } from "cookies-next";

import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const pb = new PocketBase(PB_URL);

export const auth = {
    register: async (email: string, password: string, data: Record<string, any> = {}) => {
        try {
            const user = await pb.collection("users").create({
                email,
                password,
                ...data,
            });
            return user;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    },

    login: async (username: string, password: string) => {
        try {
            await pb.collection("users").authWithPassword(username, password);
            console.log("tset");
            setCookie("pb_auth", pb.authStore.token, {
                path: "/",
                sameSite: "lax",
            });

            //Wenn Production:
            //setCookie("pb_auth", pb.authStore.token, {
            //    httpOnly: true,
            //    path: "/",
            //    secure: true,
            //    sameSite: "lax",
            //});

            redirect("/home");
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    },

    logout: () => {
        console.log("big boobs");
        pb.authStore.clear();
        document.cookie = `pb_auth=; path=/; Secure`;
        redirect("/");
    },

    getUser: () => {
        return pb.authStore.record;
    },

    getToken: () => {
        return pb.authStore.token;
    },

    isAuthenticated: () => {
        return pb.authStore.isValid;
    },
};

export default auth;
