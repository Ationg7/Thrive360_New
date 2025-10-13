import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const isLoggedIn = !!authToken;
  const isAdmin = user?.role === 'admin';

  const login = (token, userObj) => {
    setAuthToken(token);
    setUser(userObj);
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  useEffect(() => {
    // Sync state with localStorage on mount
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    
    // Validate stored data
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAuthToken(token);
        setUser(userData);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setAuthToken(null);
        setUser(null);
      }
    } else {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isAdmin, authToken, user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
