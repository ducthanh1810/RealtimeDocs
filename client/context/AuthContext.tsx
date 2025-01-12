import { GetProfile } from "@/api/auth";
import { User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: any;
  setUser: (user: any) => void;
  title: string;
  setTitle: (title: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
}>({
  user: null,
  setUser: () => {},
  title: "",
  setTitle: () => {},
  avatar: "",
  setAvatar: () => {},
});

export default AuthContext;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>();
  const [title, setTitle] = useState("");
  const [avatar, setAvatar] = useState("");

  const contextData = {
    user,
    setUser,
    title,
    setTitle,
    avatar,
    setAvatar,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
