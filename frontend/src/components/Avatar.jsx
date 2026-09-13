import React, { useState } from 'react'
import { initials } from '../utils/format'

/** Unique local avatar image per employee code; falls back to initials if missing. */
export default function Avatar({ name, code, size = 36 }) {
  const [failed, setFailed] = useState(false)
  const src = code ? `/avatars/${encodeURIComponent(code)}.svg` : null

  if (!src || failed) {
    return (
      <span className="avatar-circle" style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}>
        {initials(name)}
      </span>
    )
  }
  return (
    <img className="avatar-img" src={src} alt={name} loading="lazy"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)} />
  )
}
