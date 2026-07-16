import { useEffect, useState } from 'react'
import BoardView from './components/BoardView.jsx'
import { listBoards, createBoard, getBoard } from './api.js'

export default function App() {
  const [boards, setBoards] = useState([])
  const [activeBoard, setActiveBoard] = useState(null)
  const [newBoardName, setNewBoardName] = useState('')
  const [loading, setLoading] = useState(true)

  const refreshList = async () => {
    const res = await listBoards()
    setBoards(res.data)
    return res.data
  }

  const openBoard = async (id) => {
    const res = await getBoard(id)
    setActiveBoard(res.data)
  }

  const refreshActive = async () => {
    if (activeBoard) await openBoard(activeBoard.id)
  }

  useEffect(() => {
    (async () => {
      const data = await refreshList()
      if (data.length > 0) await openBoard(data[0].id)
      setLoading(false)
    })()
  }, [])

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newBoardName.trim()) return
    const res = await createBoard({ name: newBoardName })
    setNewBoardName('')
    await refreshList()
    setActiveBoard(res.data)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1><span className="mark">Forge</span> · Kanban</h1>
        <span className="subtitle">boards → lists → cards</span>
      </header>

      <div className="board-picker">
        {boards.map((b) => (
          <button
            key={b.id}
            className={`board-chip${activeBoard?.id === b.id ? ' active' : ''}`}
            onClick={() => openBoard(b.id)}
          >
            {b.name} ({b.lists_count})
          </button>
        ))}
      </div>

      <form className="new-board-form" onSubmit={handleCreateBoard}>
        <input
          placeholder="New board name..."
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
        />
        <button type="submit">+ Create board</button>
      </form>

      {loading && <p className="empty-state">Loading...</p>}

      {!loading && !activeBoard && (
        <p className="empty-state">No boards yet — create your first one above.</p>
      )}

      {activeBoard && (
        <BoardView board={activeBoard} onChanged={refreshActive} />
      )}
    </div>
  )
}
