import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const ChatComponent = () => {
    const [userId, setUserId] = useState("B0141CF6-CB3B-4151-9E98-12FE0AB2C3B1");
    const [botId, setBotId] = useState("438E95DC-C0B1-4000-A71F-6BAA4AA097F1");
    const [messages, setMessages] = useState([]);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        // Solicita o userId ao usuário quando o componente é montado
        // const id = prompt("Por favor, insira seu ID de usuário:");
        // setUserId(id);

        if (userId) {
            const connect = new signalR.HubConnectionBuilder()
                .withUrl(`https://localhost:44371/chathub?userId=${userId}&botId=${botId}`)
                .withAutomaticReconnect()
                .build();

            connect.start()
                .then(() => console.log(`User ${userId} connected to SignalR server`))
                .catch(err => console.error('Error while connecting to SignalR server', err));

            connect.on("ReceiveMessage", (user, message) => {
                setMessages(messages => [...messages, { user, message }]);
            });

            setConnection(connect);

            return () => {
                connect.stop();
            };
        }
    }, []);

    const sendMessage = async (message) => {
        if (connection && message) {
            try {
                await connection.invoke("SendMessage", `User${userId}`, message);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

    if (!userId) {
        return <div>Carregando...</div>;
    }

    return (
        <div>
            <h2>Chat</h2>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.user}</strong>: {msg.message}
                    </div>
                ))}
            </div>
            <input
                type="text"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage(e.target.value);
                        e.target.value = '';
                    }
                }}
                placeholder="Digite uma mensagem e pressione Enter"
            />
        </div>
    );
};

export default ChatComponent;
