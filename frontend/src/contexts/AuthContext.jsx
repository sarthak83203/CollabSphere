import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const handleLogin = async (username, password) => {
    console.log("Login:", username, password);

    if (username === "admin" && password === "1234") {
      setUser({ username });
      return "Login successful";
    } else {
      throw {
        response: {
          data: { message: "Invalid username or password" },
        },
      };
    }
  };

  const handleRegister = async (name, username, password) => {
    console.log("Register:", name, username, password);
    return "Registered successfully!";
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, handleLogin, handleRegister, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};