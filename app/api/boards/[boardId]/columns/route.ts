import db from '@/utils/firestore';
import { collection, addDoc, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const colSnap = await getDocs(collection(db, 'boards', params.boardId, 'columns'));
    const columns = colSnap.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ columns });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const body = await req.json();
    const { title, order } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const colRef = await addDoc(collection(db, 'boards', params.boardId, 'columns'), {
      title: title.trim(),
      order: order ?? 0,
      createdAt: Timestamp.now(),
    });
    return NextResponse.json({ id: colRef.id, title });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create column' }, { status: 500 });
  }
}
