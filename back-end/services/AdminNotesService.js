class AdminNotesServiceClass {
  constructor() {
    this.notes = [];
    this.nextId = 1;
  }

  list(targetType, targetId) {
    return this.notes
      .filter(note => note.targetType === targetType && String(note.targetId) === String(targetId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  create({ targetType, targetId, body, actorId = null, actorName = 'Admin' }) {
    const note = {
      id: this.nextId++,
      targetType,
      targetId,
      body: String(body || '').trim().slice(0, 1200),
      actorId,
      actorName,
      createdAt: new Date(),
    };
    if (!note.body) {
      const error = new Error('Note text is required');
      error.statusCode = 400;
      throw error;
    }
    this.notes.unshift(note);
    return note;
  }
}

export const AdminNotesService = new AdminNotesServiceClass();
