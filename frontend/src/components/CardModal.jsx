import { useState } from 'react'
import { updateCard, deleteCard, attachTag, detachTag, createTag } from '../api.js'
import TagBadge from './TagBadge.jsx'

const TAG_COLORS = ['#E85D2C', '#4C6B8A', '#7A9B57', '#B25FA8', '#C43B2B']

export default function CardModal({ card, board, onClose, onChanged }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dueDate, setDueDate] = useState(card.due_date || '')
  const [memberId, setMemberId] = useState(card.member_id || '')
  const [newTagName, setNewTagName] = useState('')

  const cardTagIds = new Set((card.tags || []).map((t) => t.id))

  const save = async () => {
    await updateCard(card.id, {
      title,
      description,
      due_date: dueDate || null,
      member_id: memberId || null,
    })
    onChanged()
    onClose()
  }

  const remove = async () => {
    await deleteCard(card.id)
    onChanged()
    onClose()
  }

  const toggleTag = async (tag) => {
    if (cardTagIds.has(tag.id)) {
      await detachTag(card.id, tag.id)
    } else {
      await attachTag(card.id, tag.id)
    }
    onChanged()
  }

  const addNewTag = async () => {
    if (!newTagName.trim()) return
    const color = TAG_COLORS[(board.tags?.length || 0) % TAG_COLORS.length]
    const res = await createTag(board.id, { name: newTagName, color })
    setNewTagName('')
    await attachTag(card.id, res.data.id)
    onChanged()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit card</h2>

        <label>Title</label>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Description</label>
        <textarea className="field" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Due date</label>
        <input type="date" className="field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        <label>Assigned member</label>
        <select className="field" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          <option value="">— unassigned —</option>
          {(board.members || []).map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <label>Tags</label>
        <div className="tag-list">
          {(board.tags || []).map((tag) => (
            <span
              key={tag.id}
              onClick={() => toggleTag(tag)}
              style={{ opacity: cardTagIds.has(tag.id) ? 1 : 0.35, cursor: 'pointer' }}
            >
              <TagBadge tag={tag} />
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input
            placeholder="New tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <button type="button" className="ghost" onClick={addNewTag}>+ Tag</button>
        </div>

        <div className="modal-actions">
          <button className="ghost" onClick={remove} style={{ color: 'var(--overdue)' }}>Delete card</button>
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
