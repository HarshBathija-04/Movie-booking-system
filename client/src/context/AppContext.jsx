import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AppContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => (localStorage.getItem("token") ? readUser() : null));

  const persistSession = useCallback((token, nextUser) => {
    setUser(nextUser);
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  const logout = useCallback(() => {
    persistSession("", null);
    toast.success("Signed out");
  }, [persistSession]);

  /** mode is "login" or "register", matching the API route. */
  const authenticate = async (mode, payload) => {
    const { data } = await api.post(`/auth/${mode}`, payload);
    persistSession(data.token, data.user);
    const firstName = data.user.name.split(" ")[0];
    toast.success(mode === "login" ? `Welcome back, ${firstName}` : `You're in, ${firstName}. Enjoy the show!`);
    return data.user;
  };

  // Refresh the cached profile once per load, and drop the session when the API says it expired.
  useEffect(() => {
    if (!localStorage.getItem("token")) return undefined;
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch(() => {});
    const onExpired = () => {
      persistSession("", null);
      toast.error("Your session expired. Please sign in again.");
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [persistSession]);

  return <AppContext.Provider value={{ user, authenticate, logout }}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
