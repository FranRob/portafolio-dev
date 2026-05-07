import prisma from '../../lib/prisma.js';
import type { ContactMessageResponse, CreateContactRequest } from '../../dtos/index.js';

function toResponse(msg: {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  category: string | null;
  createdAt: Date;
}): ContactMessageResponse {
  return {
    id: msg.id,
    name: msg.name,
    email: msg.email,
    message: msg.message,
    read: msg.read,
    category: msg.category,
    createdAt: msg.createdAt.toISOString(),
  };
}

export async function createMessage(data: CreateContactRequest): Promise<ContactMessageResponse> {
  const msg = await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
    },
  });
  return toResponse(msg);
}

export async function getAllMessages(): Promise<ContactMessageResponse[]> {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return messages.map(toResponse);
}

export async function markAsRead(id: string): Promise<ContactMessageResponse | null> {
  try {
    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { read: true, category: 'leido' },
    });
    return toResponse(msg);
  } catch {
    return null;
  }
}

export async function markAsUnread(id: string): Promise<ContactMessageResponse | null> {
  try {
    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { read: false, category: 'no-leido' },
    });
    return toResponse(msg);
  } catch {
    return null;
  }
}

export async function updateCategory(id: string, category: string): Promise<ContactMessageResponse | null> {
  try {
    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { category },
    });
    return toResponse(msg);
  } catch {
    return null;
  }
}

export async function deleteMessage(id: string): Promise<boolean> {
  try {
    await prisma.contactMessage.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
