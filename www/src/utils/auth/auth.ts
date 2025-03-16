import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "https://pbe.eichenzell.nausseite.de";
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
        console.log("Try Login: " + username);
        try {
            const authData = await pb.collection("users").authWithPassword(username, password);
            return authData;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    },

    logout: () => {
        pb.authStore.clear();
    },

    getUser: () => {
        return pb.authStore.model;
    },

    isAuthenticated: () => {
        return pb.authStore.isValid;
    }


};


export default pb;
