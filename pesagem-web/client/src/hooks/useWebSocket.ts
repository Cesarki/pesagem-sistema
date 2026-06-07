import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [novaPesagem, setNovaPesagem] = useState<any>(null);
  const [pesagemAtualizada, setPesagemAtualizada] = useState<any>(null);

  useEffect(() => {
    // Conectar ao servidor WebSocket
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado do WebSocket');
      setIsConnected(false);
    });

    // Escutar evento de nova pesagem
    socket.on('nova_pesagem', (data) => {
      console.log('📍 Nova pesagem recebida:', data);
      setNovaPesagem(data);
    });

    // Escutar evento de pesagem atualizada
    socket.on('pesagem_atualizada', (data) => {
      console.log('📍 Pesagem atualizada:', data);
      setPesagemAtualizada(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    novaPesagem,
    pesagemAtualizada,
    setNovaPesagem,
    setPesagemAtualizada,
  };
};
