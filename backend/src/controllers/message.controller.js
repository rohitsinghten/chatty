import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSidebar = async (req,res) => {
  try {
    const myId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: myId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log(error);
    console.log("error in get users for sidebar controller");
    res.status(500).json({ message: "Error getting users for sidebar" });
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessages = async(req,res) => {
  const {id : receiverId} = req.params
  try {
    const {text,image} = req.body
    const senderId = req.user._id
    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image:imageUrl
    })

    await newMessage.save()
    // todo : realtime functionality goes there => socket io
    const receiverSocketId = getReceiverSocketId(receiverId)
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",newMessage)
    }
    res.status(200).json(newMessage)
  } catch (error) {
    console.log(error);
    console.log("error in send messages controller");
    res.status(500).json({ message: "Error sending messages" });
  }
}