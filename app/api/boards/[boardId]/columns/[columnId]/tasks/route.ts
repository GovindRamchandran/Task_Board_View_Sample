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

export async function GET(
  _req: NextRequest,
  { params }: { params: { boardId: string; columnId: string } }
) {
  try {
    const taskSnap = await getDocs(
      collection(db, 'boards', params.boardId, 'columns', params.columnId, 'tasks')
    );
    const tasks = taskSnap.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ tasks });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string; columnId: string } }
) {
  try {
    const body = await req.json();
    const { title, description } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }
    const taskRef = await addDoc(
      collection(db, 'boards', params.boardId, 'columns', params.columnId, 'tasks'),
      {
        title: title.trim(),
        description: description?.trim() || '',
        createdAt: Timestamp.now(),
      }
    );
    return NextResponse.json({ id: taskRef.id, title });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}