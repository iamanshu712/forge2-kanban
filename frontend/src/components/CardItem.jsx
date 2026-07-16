import TagBadge from './TagBadge.jsx'

export default function CardItem({ card, onOpen, onDragStart }) {
  return (
    <div
      className={`card-item${card.is_overdue ? ' overdue' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onClick={() => onOpen(card)}
    >
      <p className="card-title">{card.title}</p>

      {card.tags?.length > 0 && (
        <div className="tag-list">
          {card.tags.map((t) => <TagBadge key={t.id} tag={t} />)}
        </div>
      )}

      <div className={`card-meta${card.is_overdue ? ' overdue-flag' : ''}`}>
        {card.due_date && (
          <span>{card.is_overdue ? '⚠ overdue · ' : 'due '}{card.due_date}</span>
        )}
        {card.member && (
          <span className="member-avatar" style={{ background: card.member.color }}>
            {card.member.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}
