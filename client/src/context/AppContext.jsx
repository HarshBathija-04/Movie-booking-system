import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const logout = () => {
    persistSession("", null);
    toast.success("Logged out");
  };

  const fetchMovies = async (search = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("/movies", { params: { search } });
      setMovies(data.movies || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persistSession(data.token, data.user);
    toast.success("Login successful");
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistSession(data.token, data.user);
    toast.success("Registration successful");
    return data.user;
  };

  const refreshProfile = async () => {
    if (!token) return;

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        persistSession("", null);
      }
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (!token) return;
    refreshProfile();
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        fetchMovies,
        loading,
        login,
        logout,
        movies,
        register,
        token,
        user,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
