import React, { useEffect, useRef } from 'react'

/** Fades/slides children in when they enter the viewport. */
export default function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.transitionDelay = delay ? `${delay * 70}ms` : '0ms'
    if (!('IntersectionObserver' in window)) {
      el.classList.add('visible')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.06 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return <div ref={ref} className="reveal">{children}</div>
}
