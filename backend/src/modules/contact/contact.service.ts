import prisma from '../../lib/prisma.js';

export interface ContactMessageData {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export async function createMessage(data: ContactMessageData): Promise<ContactMessageRecord> {
  return prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
    },
  });
}

export async function getAllMessages(): Promise<ContactMessageRecord[]> {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function markAsRead(id: string): Promise<ContactMessageRecord> {
  return prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
}
