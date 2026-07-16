export default function TagBadge({ tag, onRemove }) {
  return (
    <span
      className="tag-badge"
      style={{ background: tag.color }}
      onClick={onRemove}
      title={onRemove ? 'Click to remove' : tag.name}
    >
      {tag.name}
    </span>
  )
}
