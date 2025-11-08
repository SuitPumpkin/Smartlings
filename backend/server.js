const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('../frontend'));

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Almacenamiento en memoria
const rooms = new Map();
const userToRoom = new Map(); // Para rastrear usuario -> sala

io.on('connection', (socket) => {
  console.log('🔗 Usuario conectado:', socket.id);

  // Crear sala - CON CONTROL DE SALAS EXISTENTES
  socket.on('create-room', (teacherName) => {
    // Verificar si este profesor ya tiene una sala
    const existingRoomId = userToRoom.get(socket.id);
    if (existingRoomId && rooms.has(existingRoomId)) {
      console.log(`⚠️ Profesor ${teacherName} ya tiene sala: ${existingRoomId}`);
      socket.emit('room-created', existingRoomId);
      return;
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = {
      id: roomId,
      teacher: { 
        id: socket.id, 
        name: teacherName,
        socketId: socket.id 
      },
      students: new Map(),
      gameState: 'waiting',
      createdAt: new Date()
    };
    
    rooms.set(roomId, room);
    userToRoom.set(socket.id, roomId);
    
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log(`🎯 Sala creada: ${roomId} por ${teacherName}`);
  });

  // Unirse a sala - CON VALIDACIÓN MEJORADA
  socket.on('join-room', (roomId, studentName) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Sala no encontrada');
      return;
    }

    // Verificar si la sala sigue activa (profesor conectado)
    if (!room.teacher || !io.sockets.sockets.get(room.teacher.socketId)) {
      socket.emit('error', 'El profesor ha abandonado la sala');
      rooms.delete(roomId);
      return;
    }

    const student = {
      id: socket.id,
      name: studentName,
      score: 0,
      avatar: `avatar-${Math.floor(Math.random() * 5) + 1}`,
      socketId: socket.id,
      joinedAt: new Date()
    };

    room.students.set(socket.id, student);
    userToRoom.set(socket.id, roomId);
    socket.join(roomId);
    
    // Notificar a TODOS en la sala, incluyendo al profesor
    io.to(roomId).emit('user-joined', Array.from(room.students.values()));
    socket.emit('joined-room', roomId);
    console.log(`👤 ${studentName} se unió a sala ${roomId}`);
  });

  // Enviar pregunta
  socket.on('start-question', (roomId, question) => {
    const room = rooms.get(roomId);
    if (room && room.teacher.socketId === socket.id) {
      io.to(roomId).emit('new-question', question);
    }
  });

  // Recibir respuesta - NOTIFICAR A TODOS INCLUYENDO PROFESOR
  socket.on('submit-answer', (roomId, answerData) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const student = room.students.get(socket.id);
    if (student) {
      student.score += 10;
      // Emitir a TODA la sala (estudiantes Y profesor)
      io.to(roomId).emit('score-update', Array.from(room.students.values()));
      console.log(`📊 ${student.name} ahora tiene ${student.score} puntos`);
    }
  });

  // Manejar desconexiones
  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado:', socket.id);
    const roomId = userToRoom.get(socket.id);
    
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        // Si es el profesor que se desconecta
        if (room.teacher && room.teacher.socketId === socket.id) {
          console.log(`🏫 Profesor abandonó sala ${roomId}, cerrando sala...`);
          
          // Notificar a todos los estudiantes
          io.to(roomId).emit('room-closed', 'El profesor ha abandonado la sala');
          
          // Expulsar a todos de la sala
          room.students.forEach(student => {
            const studentSocket = io.sockets.sockets.get(student.socketId);
            if (studentSocket) {
              studentSocket.leave(roomId);
              userToRoom.delete(student.socketId);
            }
          });
          
          // Eliminar la sala
          rooms.delete(roomId);
          userToRoom.delete(socket.id);
          
        } else {
          // Es un estudiante que se desconecta
          const student = room.students.get(socket.id);
          if (student) {
            console.log(`🎒 Estudiante ${student.name} abandonó sala ${roomId}`);
            room.students.delete(socket.id);
            userToRoom.delete(socket.id);
            
            // Notificar a los demás en la sala
            io.to(roomId).emit('user-left', {
              studentId: socket.id,
              updatedStudents: Array.from(room.students.values())
            });
          }
        }
      }
    }
  });

  // Nuevo: Comando para que el profesor cierre la sala manualmente
  socket.on('close-room', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.teacher.socketId === socket.id) {
      console.log(`🏫 Profesor cerró manualmente sala ${roomId}`);
      
      // Notificar a todos los estudiantes
      io.to(roomId).emit('room-closed', 'El profesor ha cerrado la sala');
      
      // Expulsar a todos
      room.students.forEach(student => {
        const studentSocket = io.sockets.sockets.get(student.socketId);
        if (studentSocket) {
          studentSocket.leave(roomId);
          userToRoom.delete(student.socketId);
        }
      });
      
      // Eliminar la sala
      rooms.delete(roomId);
      userToRoom.delete(socket.id);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});