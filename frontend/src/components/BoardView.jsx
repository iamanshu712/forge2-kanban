import { useState } from 'react'
import ListColumn from './ListColumn.jsx'
import CardModal from './CardModal.jsx'
import { createList, createMember } from '../api.js'

export default function BoardView({ board, onChanged }) {
  const [openCard, setOpenCard] = useState(null)
  const [addingList, setAddingList] = useState(false)
  const [listName, setListName] = useState('')
  const [memberName, setMemberName] = useState('')

  const handleDragCardStart = (e, card, fromListId) => {
    e.dataTransfer.setData('cardId', card.id)
    e.dataTransfer.setData('fromListId', String(fromListId))
  }

  const addList = async (e) => {
    e.preventDefault()
    if (!listName.trim()) return
    await createList(board.id, { name: listName })
    setListName('')
    setAddingList(false)
    onChanged()
  }

  const addMember = async (e) => {
    e.preventDefault()
    if (!memberName.trim()) return
    const colors = ['#4C6B8A', '#7A9B57', '#B25FA8', '#E85D2C']
    const color = colors[(board.members?.length || 0) % colors.length]
    await createMember(board.id, { name: memberName, color })
    setMemberName('')
    onChanged()
  }

  return (
    <div>
      <form onSubmit={addMember} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Add a board member (name)..."
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
        />
        <button type="submit" className="ghost">+ Member</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--paper-dim)', alignSelf: 'center' }}>
          {(board.members || []).map((m) => m.name).join(' · ') || 'no members yet'}
        </span>
      </form>

      <div className="board">
        {(board.lists || []).map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            onCardOpen={setOpenCard}
            onChanged={onChanged}
            onDragCardStart={handleDragCardStart}
          />
        ))}

        <div className="list-column add-new">
          {addingList ? (
            <form className="add-list-form" onSubmit={addList} style={{ width: '100%' }}>
              <input
                autoFocus
                placeholder="List name..."
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="submit">Add list</button>
                <button type="button" className="ghost" onClick={() => setAddingList(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="ghost" style={{ width: '100%' }} onClick={() => setAddingList(true)}>
              + Add list
            </button>
          )}
        </div>
      </div>

      {openCard && (
        <CardModal
          card={openCard}
          board={board}
          onClose={() => setOpenCard(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  )
}
