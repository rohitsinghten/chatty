import {create} from "zustand";
import {toast} from "react-hot-toast";
import {axiosInstance} from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: null,
  isMessagesLoading: null,

  getUsers: async() => {
    set({isUserLoading : true})
    try{
      const response = await axiosInstance.get("/messages/users")
      set({users : response.data})
    } catch (error) {
      console.log(error)
      console.log("error in get users store")
      toast.error(error.response.data.message)
    } finally {
      set({isUserLoading : false})
    }
  },
  getMessages: async(id) => {
    set({isMessagesLoading : true})
    try{
      const response = await axiosInstance.get(`/messages/${id}`)
      set({messages : response.data})
    } catch (error) {
      console.log(error)
      console.log("error in get messages store")
      toast.error(error.response.data.message)
    } finally {
      set({isMessagesLoading : false})
    }
  },
  sendMessage: async(data) => {
    const {selectedUser,messages} = get()
    try{
      const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`,data)
      set({messages : [...messages,response.data]})
    } catch (error) {
      console.log(error)
      console.log("error in send message store")
      toast.error(error.response.data.message)
    }
  },
  subscribeToMessages: () => {
    const {selectedUser} = get()
    if(!selectedUser) return

    const socket = useAuthStore.getState().socket

    // todo optimize this one latter also
    socket.on("newMessage", (newMessage) => {
      if(newMessage.senderId !== selectedUser._id) return // TO DO DONE
      set({messages : [...get().messages,newMessage]})
    })
  },
  unsubscribeToMessages: ()=>{
    const socket = useAuthStore.getState().socket
    socket.off("newMessage")
  },

  setSelectedUser: (user) => set({selectedUser : user})

}))