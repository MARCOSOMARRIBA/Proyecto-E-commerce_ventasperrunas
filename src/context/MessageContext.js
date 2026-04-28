import React, { createContext, useContext, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [messageData, setMessageData] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const showMessage = ({ title, message, type = "info" }) => {
    setMessageData({
      visible: true,
      title,
      message,
      type,
    });
  };

  const closeMessage = () => {
    setMessageData((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const getIcon = () => {
    switch (messageData.type) {
      case "success":
        return <FaCheckCircle />;
      case "warning":
        return <FaExclamationTriangle />;
      case "error":
        return <FaTimesCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <MessageContext.Provider value={{ showMessage, closeMessage }}>
      {children}

      {messageData.visible && (
        <div className="custom-message-backdrop">
          <div className={`custom-message-box ${messageData.type}`}>
            <button className="custom-message-close" onClick={closeMessage}>
              ×
            </button>

            <div className="custom-message-icon">{getIcon()}</div>

            <h3>{messageData.title}</h3>

            <p>{messageData.message}</p>

            <button className="custom-message-btn" onClick={closeMessage}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </MessageContext.Provider>
  );
};
