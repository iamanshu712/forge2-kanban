import { useState } from 'react'
import CardItem from './CardItem.jsx'
import { createCard, moveCard } from '../api.js'

export default function ListColumn({ list, onCardOpen, onChanged, onDragCardStart }) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await createCard(list.id, { title })
    setTitle('')
    setAdding(false)
    onChanged()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData('cardId')
    const fromListId = e.dataTransfer.getData('fromListId')
    if (!cardId) return
    if (String(list.id) === fromListId) return // dropped on same list, no-op

    const position = list.cards?.length || 0
    await moveCard(cardId, { board_list_id: list.id, position })
    onChanged()
  }

  return (
    <div
      className="list-column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="list-column-header">
        <h3>{list.name}</h3>
        <span className="rivet-count">{list.cards?.length || 0}</span>
      </div>

      {(list.cards || []).map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onOpen={onCardOpen}
          onDragStart={(e, c) => onDragCardStart(e, c, list.id)}
        />
      ))}

      {adding ? (
        <form className="add-card-form" onSubmit={handleAddCard}>
          <input
            autoFocus
            placeholder="Card title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit">Add card</button>
            <button type="button" className="ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="ghost" style={{ width: '100%', marginTop: 6 }} onClick={() => setAdding(true)}>
          + Add card
        </button>
      )}
    </div>
  )
}
