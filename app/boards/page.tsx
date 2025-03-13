'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BoardListPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: any[] }>({});
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await axios.get('/api/boards');
        setBoards(res.data.boards);
        if (res.data.boards.length > 0) {
          setSelectedBoard(res.data.boards[0]);
        }
      } catch (err) {
        console.error('Error fetching boards', err);
      }
    };
    fetchBoards();
  }, []);

  useEffect(() => {
    const fetchBoardDetails = async () => {
      if (!selectedBoard?.id) return;
      try {
        const colRes = await axios.get(`/api/boards/${selectedBoard.id}/columns`);
        setColumns(colRes.data.columns);
        const taskMap: { [key: string]: any[] } = {};
        await Promise.all(
          colRes.data.columns.map(async (col: any) => {
            const taskRes = await axios.get(
              `/api/boards/${selectedBoard.id}/columns/${col.id}/tasks`
            );
            taskMap[col.id] = taskRes.data.tasks;
          })
        );
        setTasks(taskMap);
      } catch (err) {
        console.error('Error fetching board details', err);
      }
    };
    fetchBoardDetails();
  }, [selectedBoard]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newTitle.trim()) {
      setError('Board title is required');
      return;
    }
    try {
      const res = await axios.post('/api/boards', { title: newTitle });
      setBoards((prev) => [...prev, res.data]);
      setNewTitle('');
      setShowModal(false);
    } catch (err: any) {
      console.error('Error creating board', err);
      setError(err?.response?.data?.error || 'Failed to create board');
    }
  };

  const handleTaskDragStart = (e: any, task: any, fromColumnId: string) => {
    e.dataTransfer.setData('task', JSON.stringify({ task, fromColumnId }));
  };

  const handleTaskDrop = async (e: any, toColumnId: string) => {
    const { task, fromColumnId } = JSON.parse(e.dataTransfer.getData('task'));
    if (fromColumnId === toColumnId) return;
    try {
      const res = await axios.post(`/api/boards/${selectedBoard.id}/columns/${toColumnId}/tasks`, {
        title: task.title,
        description: task.description,
      });
      await axios.delete(
        `/api/boards/${selectedBoard.id}/columns/${fromColumnId}/tasks/${task.id}`
      );
      setTasks((prev) => {
        const updated = { ...prev };
        updated[fromColumnId] = prev[fromColumnId].filter((t) => t.id !== task.id);
        updated[toColumnId] = [...(prev[toColumnId] || []), { ...res.data }];
        return updated;
      });
    } catch (err) {
      console.error('Error moving task', err);
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      const res = await axios.post(`/api/boards/${selectedBoard.id}/columns`, {
        title: newColumnTitle.trim(),
      });
      setColumns((prev) => [...prev, res.data]);
      setShowColumnModal(false);
      setNewColumnTitle('');
    } catch (err) {
      console.error('Error creating column', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || columns.length === 0) return;
    const firstColumnId = columns[0].id;
    try {
      const res = await axios.post(
        `/api/boards/${selectedBoard.id}/columns/${firstColumnId}/tasks`,
        {
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim(),
        }
      );
      setTasks((prev) => ({
        ...prev,
        [firstColumnId]: [...(prev[firstColumnId] || []), res.data],
      }));
      setNewTaskTitle('');
      setNewTaskDesc('');
      setShowTaskModal(false);
    } catch (err) {
      console.error('Error creating task', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-[#20212C]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-600 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-row items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="none" stroke="#635FC7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5v11m6-11v6m6-6v14" />
            </svg>
            <h2 className="text-3xl font-extrabold tracking-wide text-[#635FC7] dark:text-white">kanban</h2>
          </div>
          <h3 className="text-sm text-gray-400 uppercase mb-2">All Boards ({boards.length})</h3>
          <ul className="space-y-2">
            {boards.map((board) => (
              <li
                key={board.id}
                className={`w-full px-3 py-2 rounded-lg cursor-pointer hover:bg-[#E4E4FD] transition ${selectedBoard?.id === board.id ? 'bg-[#E4E4FD]' : ''}`}
                onClick={() => setSelectedBoard(board)}
              >
                <div className="flex flex-row items-center justify-start gap-5">
                  <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                    <path fill="#635FC7" d="M3 6.75A3.75 3.75 0 0 1 6.75 3h14.5A3.75 3.75 0 0 1 25 6.75v14.5A3.75 3.75 0 0 1 21.25 25H6.75A3.75 3.75 0 0 1 3 21.25zm1.5 7.75v6.75a2.25 2.25 0 0 0 2.25 2.25H16v-9zM16 13V4.5H6.75A2.25 2.25 0 0 0 4.5 6.75V13zm5.25 10.5a2.25 2.25 0 0 0 2.25-2.25V18h-6v5.5zm2.25-7v-5h-6v5zm-6-12V10h6V6.75a2.25 2.25 0 0 0-2.25-2.25z" />
                  </svg>
                  <span className="text-sm font-medium text-[#20212C] dark:text-white truncate">{board.title}</span>
                </div>
              </li>
            ))}
            <li>
              <div className="flex flex-row items-center justify-between px-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                  <path fill="#635FC7" d="M3 6.75A3.75 3.75 0 0 1 6.75 3h14.5A3.75 3.75 0 0 1 25 6.75v14.5A3.75 3.75 0 0 1 21.25 25H6.75A3.75 3.75 0 0 1 3 21.25zm1.5 7.75v6.75a2.25 2.25 0 0 0 2.25 2.25H16v-9zM16 13V4.5H6.75A2.25 2.25 0 0 0 4.5 6.75V13zm5.25 10.5a2.25 2.25 0 0 0 2.25-2.25V18h-6v5.5zm2.25-7v-5h-6v5zm-6-12V10h6V6.75a2.25 2.25 0 0 0-2.25-2.25z" />
                </svg>
                <button onClick={() => setShowModal(true)} className="w-full text-sm font-semibold text-[#635FC7] hover:underline cursor-pointer">
                  + Create New Board
                </button>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex items-center justify-between mt-8 border-t border-gray-300 pt-4">
          <span className="text-sm text-gray-500">Light Mode</span>
          <div className="relative w-10 h-5 bg-gray-300 rounded-full">
            <div className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-all" />
          </div>
        </div>
      </aside>
      {/* Board View */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-700 p-6 overflow-auto">
        {selectedBoard ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl text-black dark:text-white font-bold">{selectedBoard.title}</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="text-sm bg-[#635FC7] text-white px-4 py-3 rounded-full hover:bg-[#837EE3] cursor-pointer"
                >
                  + Add New Task
                </button>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto">
              {columns.map((col) => {
                const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
                return (
                  <div
                    key={col.id}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-w-[250px] h-fit"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleTaskDrop(e, col.id)}
                  >
                    <h2 className="flex items-center gap-2 font-semibold text-gray-500 text-md mb-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: randomColor }}
                      />
                      {`${col.title} (${tasks[col.id]?.length ?? 0})`}
                    </h2>
                    <div className="space-y-3">
                      {(tasks[col.id] || []).map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleTaskDragStart(e, task, col.id)}
                          className="bg-white dark:bg-gray-600 rounded-md p-3 shadow border border-gray-200 dark:border-gray-600 cursor-move"
                        >
                          <p className="font-medium text-sm dark:text-white">{task.title}</p>
                          {task.description?.trim() && (
                            <p className="text-xs text-gray-500 dark:text-gray-300">{task.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* + New Column box */}
              <div
                onClick={() => setShowColumnModal(true)}
                className="min-w-[250px] min-h-[50px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-400 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg cursor-pointer"
              >
                <span className="text-[#635FC7] font-semibold text-sm">+ New Column</span>
              </div>
            </div>
          </>
        ) : (
          <h1 className="text-gray-500">No board selected</h1>
        )}
      </main>

      {/* --- Board Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Board title"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
                required
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded bg-[#635FC7] text-white hover:bg-[#837EE3] cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Column Modal --- */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Column</h2>
            <form onSubmit={handleCreateColumn}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Column title"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowColumnModal(false)}
                  className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded bg-[#635FC7] text-white hover:bg-[#837EE3] cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Task Modal --- */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
                required
              />
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded bg-[#635FC7] text-white hover:bg-[#837EE3] cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
