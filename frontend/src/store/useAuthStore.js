import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";


export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningUp: false,
  inLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      get().connectSocket()
    } catch (error) {
      console.log(error);
      console.log("error in checkAuth store");
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      set({ authUser: response.data });
      toast.success("Signup successful");
      get().connectSocket()
    } catch (error) {
      console.log(error);
      console.log("error in signup store");
      toast.error(error.response.data.message);

    } finally {
      set({ isSigningUp: false });

    }
  },
  logout : async() => {
    try{
      await axiosInstance.post("/auth/logout")
      set({authUser : null})
      toast.success("Logout successful")
      get().disconnectSocket()
    } catch (error) {
      console.log(error)
      console.log("error in logout store")
      toast.error(error.response.data.message)
    }
  },
  login : async(data)=>{
    set({inLoggingIn : true})
    try {
      const response = await axiosInstance.post("/auth/login",data)
      set({authUser : response.data})
      toast.success("Login successful")
      get().connectSocket()
    } catch (error) {
      console.log(error)
      console.log("error in login store")
      toast.error(error.response.data.message)
    } finally {
      set({inLoggingIn : false})
    }
  },
  updateProfile: async(data)=>{
    set({isUpdatingProfile : true})
    try {
      const response = await axiosInstance.put("/auth/update-profile",data)
      set({authUser : response.data})
      toast.success("Profile updated successfully")
    } catch (error) {
      console.log(error)
      console.log("error in update profile store")
      toast.error(error.response.data.message)
    } finally {
      set({isUpdatingProfile : false})
    }
  },
  connectSocket : () => {
    const {authUser} = get()
    if(!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL,{
      query : {
        userId : authUser._id
      }
    })
    socket.connect();
    set({socket : socket})

    socket.on("getOnlineUsers", (userIds) => {
      set({onlineUsers : userIds})
    })
  },
  disconnectSocket : () => {
    if(get().socket?.connected) get().socket.disconnect()
  }
}));
