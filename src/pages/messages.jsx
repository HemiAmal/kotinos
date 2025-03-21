import { TextField, Button } from "@mui/material";
import MessageNav from "../components/navbar2";
import { useLocation } from "react-router-dom";
import { addDoc, collection, doc, getDocs } from "firebase/firestore";
import { database } from "../config/firebase";
import { auth } from "../config/firebase";
import { useEffect, useState, useRef } from "react";

const Messages = () => {
    const location = useLocation();
    const [message, setMessage] = useState('');
    const [messageData, setMessageData] = useState([]);
    const messagesEndRef = useRef(null);

    const addMessage = async () => {
        const userDoc = doc(database, "Users", `${auth.currentUser?.uid}`);
        const messageDoc = doc(userDoc, "Message", `${auth.currentUser?.uid}`);
        const messageRef = collection(messageDoc, `Message-${location.state.id}`);
        try {
            await addDoc(messageRef, {
                message: message,
                timestamp: new Date(),
                senderId: `${auth.currentUser?.uid}`
            });
        } catch (err) {
            console.error(err);
        }
    }

    const sendMessage = async () => {
        const userDoc = doc(database, "Users", `${location.state.id}`);
        const messageDoc = doc(userDoc, "Message", `${location.state.id}`);
        const messageRef = collection(messageDoc, `Message-${auth.currentUser?.uid}`);
        try {
            await addDoc(messageRef, {
                message: message,
                timestamp: new Date(),
                senderId: auth.currentUser?.uid,
            });
        } catch (err) {
            console.error(err);
        }
        addMessage();
        setMessage('');
    };

    const showMessage = async () => {
        const userDoc = doc(database, "Users", `${auth.currentUser?.uid}`);
        const messageDoc = doc(userDoc, "Message", `${auth.currentUser?.uid}`);
        const messageRef = collection(messageDoc, `Message-${location.state.id}`);
        
        try {
            const data = await getDocs(messageRef);
            const filteredData = data.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            const sortedMessages = filteredData.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

            setMessageData(sortedMessages);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        showMessage();
    }, [message]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageData]);

    return (
        <div className="flex flex-col h-[100vh]">
            <MessageNav username={location.state.username} role={location.state.role} />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    flex: 1,
                    overflowY: 'scroll',
                    paddingBottom: '100',
                }}
            >
                {messageData.map((userMessage, index) => {
                    const isCurrentUser = userMessage.senderId === auth.currentUser?.uid;
                    return (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start', 
                            marginBottom: '15px',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                        }}>
                            {isCurrentUser && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#999',
                                    marginBottom: '5px',
                                    textAlign: 'left',
                                    fontWeight: 'bold',
                                    marginLeft: '10px',
                                }}>
                                    You
                                </div>
                            )}

                            <div style={{
                                backgroundColor: isCurrentUser ? '#DCF8C6' : '#FFFFFF', 
                                padding: '10px',
                                borderRadius: '15px',
                                maxWidth: '80%',
                                display: 'inline-block',
                                boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
                                wordBreak: 'break-word',
                                marginLeft: isCurrentUser ? '10px' : '0',
                                marginRight: isCurrentUser ? '0' : '10px',
                            }}>
                                <span style={{ fontSize: '14px' }}>{userMessage.message}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
                                {new Date(userMessage.timestamp.seconds * 1000).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#fff',
                    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    label="Start a conversation"
                    style={{
                        width: "80%",
                        marginRight: "10px",
                        backgroundColor: "#f1f1f1",
                        borderRadius: '15px',
                    }}
                />
                <Button
                    onClick={sendMessage}
                    style={{
                        backgroundColor: "#28a745",
                        color: "#fff",
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    Send
                </Button>
            </div>
        </div>
    );
};

export default Messages;
