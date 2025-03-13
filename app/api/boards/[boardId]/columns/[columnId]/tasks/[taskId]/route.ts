import db from '@/utils/firestore';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, context: { params: { boardId: string; columnId: string; taskId: string } }) {
  try {
    const { boardId, columnId, taskId } = context.params;
    const body = await req.json();
    const { title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const taskRef = doc(db, 'boards', boardId, 'columns', columnId, 'tasks', taskId);
    await updateDoc(taskRef, {
      title: title.trim(),
      description: description?.trim() || '',
    });

    return NextResponse.json({ message: 'Task updated' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE - Delete task
export async function DELETE(_req: NextRequest, context: { params: { boardId: string; columnId: string; taskId: string } }) {
  try {
    const { boardId, columnId, taskId } = context.params;
    const taskRef = doc(db, 'boards', boardId, 'columns', columnId, 'tasks', taskId);
    await deleteDoc(taskRef);
    return NextResponse.json({ message: 'Task deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

// GET - Get single task
export async function GET(_req: NextRequest, context: { params: { boardId: string; columnId: string; taskId: string } }) {
  try {
    const { boardId, columnId, taskId } = context.params;
    const ref = doc(db, 'boards', boardId, 'columns', columnId, 'tasks', taskId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}
