// Bibliotecas usadas:
// - socket.io: https://socket.io/
// - PeerJS: https://peerjs.com/

const socket = io();
const peer = new Peer({
  key: 'YOUR_PEERJS_API_KEY',
});

// Variáveis para armazenar os elementos da tela
const videoGrid = document.getElementById('video-grid');
const localVideo = document.getElementById('local-video');

// Obtém o stream de mídia do usuário local
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then(stream => {
  // Exibe o stream de mídia do usuário local na tela
  localVideo.srcObject = stream;

  // Conecta ao servidor
  socket.on('connect', () => {
    console.log('Conectado ao servidor');

    // Envia o ID do usuário para o servidor
    socket.emit('join-room', 'ROOM_ID');

    // Escuta por eventos de novos participantes
    socket.on('user-connected', (userId) => {
      console.log('Usuário conectado:', userId);

      // Cria um novo container para o vídeo do participante
      const videoContainer = document.createElement('div');
      videoContainer.classList.add('video-container');

      // Cria um novo elemento de vídeo para o participante
      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.playsinline = true;

      // Adiciona o elemento de vídeo ao container
      videoContainer.appendChild(videoElement);

      // Adiciona o container de vídeo à grade de vídeos
      videoGrid.appendChild(videoContainer);

      // Estabelece a conexão com o novo participante
      const call = peer.call(userId, stream);
      call.on('stream', (remoteStream) => {
        // Exibe o stream de mídia do participante na tela
        videoElement.srcObject = remoteStream;
      });

      // Escuta por eventos de desconexão do participante
      call.on('close', () => {
        console.log('Usuário desconectado:', userId);

        // Remove o container de vídeo da grade
        videoContainer.remove();
      });
    });

    // Escuta por eventos de maximização de vídeo
    videoGrid.addEventListener('click', (event) => {
      const videoContainer = event.target.closest('.video-container');
      if (videoContainer) {
        videoContainer.classList.toggle('active');
      }
    });
  });

  // Escuta por eventos de desconexão do servidor
  socket.on('disconnect', () => {
    console.log('Desconectado do servidor');

    // Limpa a tela
    videoGrid.innerHTML = '';
  });
});
