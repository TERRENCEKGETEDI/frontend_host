import React, { useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

const Notifications = ({ user }) => {
  const socketRef = useRef(null);
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    if (!user || hasConnectedRef.current) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    hasConnectedRef.current = true;

    socketRef.current = io('https://backend-host-w8to.onrender.com', {
      auth: { token }
    });

    socketRef.current.on('notification', (data) => {
      toast.info(data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    socketRef.current.on('new-assignment', (data) => {
      toast.success(`New assignment: ${data.title}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    socketRef.current.on('status-update', (data) => {
      toast.info(`Status update: ${data.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    socketRef.current.on('message', (data) => {
      toast(data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnHover: true,
        draggable: true,
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        hasConnectedRef.current = false;
      }
    };
  }, [user]); // Add user to dependency array to reconnect when user changes

  // Global toast functions
  React.toast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast.info(message),
    warning: (message) => toast.warning(message),
  };

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
};

export default Notifications;