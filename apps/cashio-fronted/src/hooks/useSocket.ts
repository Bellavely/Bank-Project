import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "./authContext";

export const useSocket = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const backendUrl = import.meta.env.VITE_BACKEND_API || "http://localhost:3000/";
    const socket = io(backendUrl, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("join", user.id);
    });

    socket.on("balanceUpdated", () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);
};
