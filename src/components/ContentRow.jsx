import PosterCard from './PosterCard'

export default function ContentRow({ title, items, metaMap, ...props }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="content-row-section">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div className="card-row">
        {items.map((item) => (
          <PosterCard
            key={item.id}
            item={item}
            meta={metaMap ? metaMap[item.id] || {} : {}}
            {...props}
          />
        ))}
      </div>
    </section>
  )
}
