let _io = null;

export const setIo = (io) => { _io = io; };

export const getIo = () => _io;

export const emitToUser = (userId, event, data) => {
  if (_io) _io.to(`user:${userId}`).emit(event, data);
};
