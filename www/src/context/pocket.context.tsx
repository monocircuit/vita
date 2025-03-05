/** @format */

import {
    createContext,
    useContext,
    useCallback,
    useState,
    useEffect,
    useMemo,
    ReactNode,
} from "react"
import PocketBase, { RecordModel } from "pocketbase"
import { useInterval } from "usehooks-ts"
import {jwtDecode} from "jwt-decode"

const BASE_URL: string = "https://pbe.eichenzell.nausseite.de"

const PocketContext = createContext({})

export const PocketProvider = ({ children }: { children: ReactNode }) => {
    const pb = useMemo(() => new PocketBase(BASE_URL), [])

    const [token, setToken] = useState<string>(pb.authStore.token)
    const [user, setUser] = useState<RecordModel | null>(pb.authStore.model)

    // useEffect to set Token and User on Change
    useEffect(() => {
        return pb.authStore.onChange((token, model) => {
            setToken(token)
            setUser(model)
        })
    }, [])

    //Register Function to Register User with Email and Password
    const registerFunction = useCallback(
        async (email: string, password: string, passwordConfirm: string) => {
            return await pb
                .collection("users")
                .create({ email, password, passwordConfirm })
        },
        []
    )

    //Auth Function to Login User with Username and Password
    async function loginFunction(username: string, password: string) {
        const userData = await pb
            .collection("users")
            .authWithPassword(username, password)
    }

    // Logout Function Clears PB Store => No User any More in Store = No User Loged In
    const logoutFunction = useCallback(() => {
        pb.authStore.clear()
    }, [])

    //Refresh Session Function to Refresh the Session if Token is about to Expire
    const refreshSession = useCallback(async () => {
      if (!pb.authStore.isValid) return;
      const decoded = jwtDecode(token);
      const tokenExpiration = decoded.exp ? decoded.exp : 0;
      const expirationWithBuffer = (tokenExpiration + 300000) / 1000;
      if (tokenExpiration < expirationWithBuffer) {
        await pb.collection("users").authRefresh();
      }
    }, [token]);
  
    //useInterval to Refresh Session every 2 Minutes if Session Token is about to Expire
    useInterval(refreshSession, token ? 120000 : null);
  

    //Return Provider with all Functions and Values
    return (
      <PocketContext.Provider
        value={{ registerFunction, loginFunction, logoutFunction, user, token, pb }}
      >
        {children}
      </PocketContext.Provider>
    );
}


export const usePocket = () => useContext(PocketContext);