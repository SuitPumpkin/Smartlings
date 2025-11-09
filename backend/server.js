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
const userToRoom = new Map();

io.on('connection', (socket) => {
  console.log('🔗 Usuario conectado:', socket.id);

  // Crear sala - CON CONTROL DE SALAS EXISTENTES
  socket.on('create-room', (teacherName) => {
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
      quiz: [], // Array para almacenar preguntas
      currentQuestionIndex: -1, // Índice de pregunta actual
      questionTimer: null,
      createdAt: new Date()
    };
    
    rooms.set(roomId, room);
    userToRoom.set(socket.id, roomId);
    
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log(`🎯 Sala creada: ${roomId} por ${teacherName}`);
  });

  // Unirse a sala
  socket.on('join-room', (roomId, studentName) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Sala no encontrada');
      return;
    }

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
      joinedAt: new Date(),
      answers: new Map() // Para rastrear respuestas por pregunta
    };

    room.students.set(socket.id, student);
    userToRoom.set(socket.id, roomId);
    socket.join(roomId);
    
    io.to(roomId).emit('user-joined', Array.from(room.students.values()));
    socket.emit('joined-room', roomId);
    console.log(`👤 ${studentName} se unió a sala ${roomId}`);
  });
  
  // Profesor agrega pregunta al quiz
  socket.on('add-question', (roomId, question) => {
    const room = rooms.get(roomId);
    if (room && room.teacher.socketId === socket.id) {
      room.quiz.push({
        ...question,
        id: Date.now() + Math.random(), // ID único
        answers: new Map() // Respuestas de estudiantes
      });
      io.to(room.teacher.socketId).emit('question-added', room.quiz);
      console.log(`❓ Pregunta agregada al quiz en sala ${roomId}`);
    }
  });

  // Profesor inicia el quiz
  socket.on('start-quiz', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.teacher.socketId === socket.id && room.quiz.length > 0) {
      room.gameState = 'playing';
      room.currentQuestionIndex = 0;
      room.students.forEach(student => {
        student.score = 0; // Resetear puntuaciones
        student.answers.clear();
      });
      
      const currentQuestion = room.quiz[0];
      io.to(roomId).emit('quiz-started', {
        totalQuestions: room.quiz.length,
        firstQuestion: currentQuestion
      });
      
      console.log(`🎯 Quiz iniciado en sala ${roomId} con ${room.quiz.length} preguntas`);
    }
  });

  // Siguiente pregunta
  socket.on('next-question', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.teacher.socketId === socket.id && room.gameState === 'playing') {
      room.currentQuestionIndex++;
      
      if (room.currentQuestionIndex < room.quiz.length) {
        const question = room.quiz[room.currentQuestionIndex];
        io.to(roomId).emit('new-question', {
          question: question,
          questionNumber: room.currentQuestionIndex + 1,
          totalQuestions: room.quiz.length
        });
      } else {
        // Quiz terminado
        room.gameState = 'finished';
        io.to(roomId).emit('quiz-finished', Array.from(room.students.values()));
      }
    }
  });

  // Estudiante envía respuesta
  socket.on('submit-answer', (roomId, answerData) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;

    const student = room.students.get(socket.id);
    const currentQuestion = room.quiz[room.currentQuestionIndex];
    
    if (student && currentQuestion) {
      // Evitar respuestas duplicadas
      if (!student.answers.has(currentQuestion.id)) {
        const isCorrect = answerData.answer === currentQuestion.correctAnswer;
        if (isCorrect) {
          student.score += 10; // Puntos por respuesta correcta
        }
        
        student.answers.set(currentQuestion.id, {
          answer: answerData.answer,
          isCorrect: isCorrect,
          timestamp: new Date()
        });

        // Registrar respuesta en la pregunta también
        currentQuestion.answers.set(socket.id, {
          studentName: student.name,
          answer: answerData.answer,
          isCorrect: isCorrect
        });

        // Notificar a TODOS la actualización de puntuación
        io.to(roomId).emit('score-update', Array.from(room.students.values()));
        
        // Notificar al estudiante si su respuesta fue correcta
        socket.emit('answer-feedback', isCorrect);
        
        console.log(`📊 ${student.name} respondió: ${answerData.answer} (${isCorrect ? 'Correcto' : 'Incorrecto'}) - Puntos: ${student.score}`);
      }
    }
  });

  // Manejar desconexiones (código existente, mantener igual)
  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado:', socket.id);
    const roomId = userToRoom.get(socket.id);
    
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        if (room.teacher && room.teacher.socketId === socket.id) {
          console.log(`🏫 Profesor abandonó sala ${roomId}, cerrando sala...`);
          io.to(roomId).emit('room-closed', 'El profesor ha abandonado la sala');
          
          room.students.forEach(student => {
            const studentSocket = io.sockets.sockets.get(student.socketId);
            if (studentSocket) {
              studentSocket.leave(roomId);
              userToRoom.delete(student.socketId);
            }
          });
          
          rooms.delete(roomId);
          userToRoom.delete(socket.id);
          
        } else {
          const student = room.students.get(socket.id);
          if (student) {
            console.log(`🎒 Estudiante ${student.name} abandonó sala ${roomId}`);
            room.students.delete(socket.id);
            userToRoom.delete(socket.id);
            
            io.to(roomId).emit('user-left', {
              studentId: socket.id,
              updatedStudents: Array.from(room.students.values())
            });
          }
        }
      }
    }
  });

  // Cerrar sala manualmente (código existente, mantener igual)
  socket.on('close-room', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.teacher.socketId === socket.id) {
      console.log(`🏫 Profesor cerró manualmente sala ${roomId}`);
      io.to(roomId).emit('room-closed', 'El profesor ha cerrado la sala');
      
      room.students.forEach(student => {
        const studentSocket = io.sockets.sockets.get(student.socketId);
        if (studentSocket) {
          studentSocket.leave(roomId);
          userToRoom.delete(student.socketId);
        }
      });
      
      rooms.delete(roomId);
      userToRoom.delete(socket.id);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});