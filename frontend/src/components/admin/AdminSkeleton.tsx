/**
 * Skeleton loader components for admin pages
 * Simula la estructura de los datos mientras cargan
 */

const skeletonBase: React.CSSProperties = {
  background: 'linear-gradient(90deg, #1a1a24 25%, #252532 50%, #1a1a24 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
}

/**
 * Skeleton para lista de proyectos (AdminProjects)
 */
export function ProjectsSkeleton() {
  const badgeStyle: React.CSSProperties = {
    ...skeletonBase,
    width: '80px',
    height: '20px',
    borderRadius: '4px',
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: '#12121a', border: '1px solid #1e1e2e' }}
        >
          {/* Reorder buttons skeleton */}
          <div className="flex flex-col gap-1">
            <div style={{ ...skeletonBase, width: '16px', height: '12px', borderRadius: '2px' }} />
            <div style={{ ...skeletonBase, width: '16px', height: '12px', borderRadius: '2px' }} />
          </div>

          {/* Title skeleton */}
          <div style={{ ...skeletonBase, flex: 1, height: '16px', borderRadius: '4px' }} />

          {/* Status badge */}
          <div style={badgeStyle} />

          {/* Category badge (hidden on mobile) */}
          <div className="hidden md:block" style={badgeStyle} />

          {/* Actions skeleton */}
          <div className="flex gap-2">
            <div style={{ ...skeletonBase, width: '48px', height: '24px', borderRadius: '4px' }} />
            <div style={{ ...skeletonBase, width: '56px', height: '24px', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para lista de mensajes (AdminMessages)
 */
export function MessagesSkeleton() {
  const itemStyle: React.CSSProperties = {
    ...skeletonBase,
    height: '72px',
    borderRadius: '8px',
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{ ...itemStyle, background: '#12121a', border: '1px solid #1e1e2e' }}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton para tabs de mensajes
 */
export function TabsSkeleton() {
  const tabStyle: React.CSSProperties = {
    ...skeletonBase,
    width: '100px',
    height: '20px',
    borderRadius: '4px',
  }

  return (
    <div className="flex border-b" style={{ borderColor: '#1e1e2e' }}>
      <div style={{ ...tabStyle, marginLeft: '16px' }} />
      <div style={{ ...tabStyle, marginLeft: '16px' }} />
    </div>
  )
}

/**
 * Skeleton para detalle de proyecto (formulario)
 */
export function FormSkeleton() {
  const inputStyle: React.CSSProperties = {
    ...skeletonBase,
    height: '40px',
    borderRadius: '6px',
  }

  const textareaStyle: React.CSSProperties = {
    ...skeletonBase,
    height: '100px',
    borderRadius: '6px',
  }

  return (
    <div className="space-y-4">
      <div>
        <div style={{ ...skeletonBase, width: '80px', height: '12px', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={inputStyle} />
      </div>
      <div>
        <div style={{ ...skeletonBase, width: '120px', height: '12px', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={textareaStyle} />
      </div>
      <div>
        <div style={{ ...skeletonBase, width: '160px', height: '12px', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={inputStyle} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div style={{ ...skeletonBase, width: '60px', height: '12px', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={inputStyle} />
        </div>
        <div>
          <div style={{ ...skeletonBase, width: '100px', height: '12px', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={inputStyle} />
        </div>
      </div>
    </div>
  )
}