import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WhatsAppSessionState } from '../types/index.js';

interface WebSocketContextType {
  isConnected: boolean;
  whatsappState: WhatsAppSessionState;
  lastMessage: any;
  sendMessage: (event: string, data: any) => void;
  addListener: (event: string, callback: (data: any) => void) => () => void;
}

const defaultWAState: WhatsAppSessionState = {
  status: 'disconnected',
  qrCodeDataUrl: null,
  phoneNumber: null,
  pushName: null,
  platform: 'WhatsApp Business Web Multi-Device (Baileys)',
  lastConnectedAt: null,
  errorMessage: null,
  isLiveBaileys: true,
  reconnectAttempts: 0,
};

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  whatsappState: defaultWAState,
  lastMessage: null,
  sendMessage: () => {},
  addListener: () => () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [whatsappState, setWhatsappState] = useState<WhatsAppSessionState>(defaultWAState);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [listeners] = useState<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    // Initial fetch of whatsapp state
    fetch('/api/whatsapp/status')
      .then((r) => r.json())
      .then((data) => {
        if (data) setWhatsappState(data);
      })
      .catch(() => {});

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          setSocket(ws);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setLastMessage(parsed);

            if (parsed.event === 'whatsapp_status') {
              setWhatsappState(parsed.data);
            }

            const cbs = listeners.get(parsed.event);
            if (cbs) {
              cbs.forEach((cb) => cb(parsed.data));
            }
          } catch (e) {
            console.error('Error handling WebSocket message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          setSocket(null);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connect, 4000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const sendMessage = useCallback(
    (event: string, data: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ event, data }));
      }
    },
    [socket]
  );

  const addListener = useCallback(
    (event: string, callback: (data: any) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(callback);
      return () => {
        listeners.get(event)?.delete(callback);
      };
    },
    [listeners]
  );

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        whatsappState,
        lastMessage,
        sendMessage,
        addListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
