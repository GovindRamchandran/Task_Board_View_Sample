import db from '@/utils/firestore';
import { collection, addDoc, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { boardId: string; columnId: string } }
) {
  try {
    const body = await req.json();
    const { title, order } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const ref = doc(db, 'boards', params.boardId, 'columns', params.columnId);
    await updateDoc(ref, { title: title.trim(), order });
    return NextResponse.json({ message: 'Column updated' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update column' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { boardId: string; columnId: string } }
) {
  try {
    const ref = doc(db, 'boards', params.boardId, 'columns', params.columnId);
    await deleteDoc(ref);
    return NextResponse.json({ message: 'Column deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete column' }, { status: 500 });
  }
}