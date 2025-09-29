import { promises as fs } from 'fs';
import path from 'path';

const NOTIFS_FILE = path.join(process.cwd(), 'notifications.json');

type NotificationItem = {
  id: string;
  userEmail: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  meta?: any;
};

async function ensureFile() {
  try {
    await fs.access(NOTIFS_FILE);
  } catch {
    await fs.writeFile(NOTIFS_FILE, JSON.stringify([]));
  }
}

async function readAll(): Promise<NotificationItem[]> {
  await ensureFile();
  const data = await fs.readFile(NOTIFS_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeAll(items: NotificationItem[]) {
  await fs.writeFile(NOTIFS_FILE, JSON.stringify(items, null, 2));
}

export async function listNotifications(userEmail: string) {
  const all = await readAll();
  return all
    .filter(n => n.userEmail === userEmail)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
  const all = await readAll();
  const newItem: NotificationItem = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    read: false,
    ...item,
  };
  all.push(newItem);
  await writeAll(all);
  return newItem;
}

export async function markNotificationRead(id: string, userEmail: string) {
  const all = await readAll();
  const idx = all.findIndex(n => n.id === id && n.userEmail === userEmail);
  if (idx === -1) return null;
  all[idx].read = true;
  await writeAll(all);
  return all[idx];
}


