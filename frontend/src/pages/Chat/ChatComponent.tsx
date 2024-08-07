import React, { useState, useEffect } from "react";
import OnlineUsersList from "./OnlineUsers";
import ChatWindow from "./ChatWindow";
import { getHistoryMessages } from "../../services/auth.service";
import io, { Socket } from "socket.io-client";
import useCurrentUser from "../../hooks/useCurrentUser";
import { User } from "../../interfaces/User";
import { BACKEND_URL } from "../../utils/constants";

interface Message {
  sender: string;
  receiver: string;
  text: string;
}

const ChatComponent = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean | null>(
    null
  );
  const { user: currentUser } = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const newSocket = io(BACKEND_URL, {
      query: { userId: String(currentUser?._id) },
    });

    newSocket.on("connect", () => setIsSocketConnected(true));
    newSocket.on("disconnect", () => setIsSocketConnected(false));

    const handlePrivateMessageReceived = (receivedMessage: {
      message: Message;
    }) => {
      const message = receivedMessage.message;
      console.log("Message received", "sender", message.sender, message);
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        if (!updatedMessages[message.sender]) {
          return updatedMessages;
        }
        updatedMessages[message.sender] = [
          ...updatedMessages[message.sender],
          message,
        ];
        return updatedMessages;
      });
    };

    newSocket.on("private_message_received", handlePrivateMessageReceived);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    console.log(
      "All users messages dict:",
      messages,
      "SelectedUser",
      selectedUser
    );
  }, [messages, selectedUser]);

  const updateSelectedUser = (user: User | null) => {
    setSelectedUser(user);
  };

  const startChat = async (user: User) => {
    if (!user) return;
  
    const userId = String(user._id);
    if (!(userId in messages)) {
      setSelectedUser(user);
  
      try {
        const response = await getHistoryMessages(
          String(currentUser?._id),
          userId
        );
  
        if (response === null || response === undefined) {
          console.error("Error: No message history found.");
          return;
        }
  
        const historyMessages = Array.isArray(response) 
          ? response 
          : ('messages' in response && Array.isArray(response.messages)) 
            ? response.messages 
            : [];
  
        setMessages((prevMessages) => ({
          ...prevMessages,
          [userId]: historyMessages,
        }));
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    } else if (String(selectedUser?._id) !== userId) {
      setSelectedUser(user);
    }
    setNewMessage("");
  };
  

  const sendMessage = () => {
    if (socket && selectedUser) {
      socket.emit("send_private_message", {
        sender: String(currentUser?._id),
        receiver: selectedUser,
        text: newMessage,
      });
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        if (!updatedMessages[String(selectedUser._id)]) {
          updatedMessages[String(selectedUser._id)] = [];
        }
        updatedMessages[String(selectedUser._id)] = [
          ...updatedMessages[String(selectedUser._id)],
          {
            sender: String(currentUser?._id),
            receiver: String(selectedUser._id),
            text: newMessage,
          },
        ];
        return updatedMessages;
      });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newMessage.trim() !== "") {
      sendMessage();
    }
  };

  if (isSocketConnected === null) {
    return null;
  }
  if (isSocketConnected === false) {
    return (
      <div>
        Socket Connection failed, chat feature is unavailable. Please refresh
        and try again.
      </div>
    );
  }

  return (
    <div className="chat-container">
      {socket && currentUser && (
        <OnlineUsersList
          startChat={startChat}
          updateSelectedUser={updateSelectedUser}
          userId={String(currentUser?._id)}
          socket={socket}
        />
      )}
      <ChatWindow
        selectedUser={selectedUser}
        userId={String(currentUser?._id)}
        messages={messages[String(selectedUser?._id)] || []}
        newMessage={newMessage}
        handleKeyPress={handleKeyPress}
        sendMessage={sendMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  );
};

export default ChatComponent;
