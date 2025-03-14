import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, Timestamp, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import db from '@/utils/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get('boardId');

  try {
    if (boardId) {
      const boardRef = doc(db, 'boards', boardId);
      const snapshot = await getDoc(boardRef);
      if (!snapshot.exists()) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
      }
      return NextResponse.json({ board: { id: snapshot.id, ...snapshot.data() } });
    }

    // If no boardId is passed, return all boards
    const snapshot = await getDocs(collection(db, 'boards'));
    const boards = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ boards });
  } catch (err) {
    console.error('Error fetching boards:', err);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { boardId, title } = body;

    if (!boardId?.trim()) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const ref = doc(db, 'boards', boardId);
    await updateDoc(ref, { title: title.trim() });

    return NextResponse.json({ message: 'Board updated' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { boardId } = body;

    if (!boardId?.trim()) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
    }

    const ref = doc(db, 'boards', boardId);
    await deleteDoc(ref);

    return NextResponse.json({ message: 'Board deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title } = body;
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 });
  }

  const docRef = await addDoc(collection(db, 'boards'), {
    title: title.trim(),
    createdAt: Timestamp.now(),
  });

  return NextResponse.json({ id: docRef.id, title });
}
