import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'admin-activity.json');

const readJson = (fallback) => {
  try {
    if (!fs.existsSync(dataFile)) return fallback;
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return fallback;
  }
};

const writeJson = (data) => {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

class AdminActivityServiceClass {
  constructor() {
    const saved = readJson({ activities: [], nextId: 1 });
    this.activities = saved.activities || [];
    this.nextId = saved.nextId || 1;
  }

  record({ actorId = null, actorName = 'Admin', action, targetType, targetId = null, summary = '', metadata = {} }) {
    const activity = {
      id: this.nextId++,
      actorId,
      actorName,
      action,
      targetType,
      targetId,
      summary,
      metadata,
      createdAt: new Date(),
    };
    this.activities.unshift(activity);
    this.activities = this.activities.slice(0, 250);
    writeJson({ activities: this.activities, nextId: this.nextId });
    return activity;
  }

  list({ limit = 80, targetType = null } = {}) {
    let rows = [...this.activities];
    if (targetType) rows = rows.filter(item => item.targetType === targetType);
    return rows.slice(0, Number(limit) || 80);
  }
}

export const AdminActivityService = new AdminActivityServiceClass();
