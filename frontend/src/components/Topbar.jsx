import React, { useEffect, useRef, useState } from 'react'
import { Search, Plus, Menu, Sun, Moon } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { employeeService } from '../services/employeeService'
import { prettyEnum } from '../utils/format'
import Avatar from './Avatar'

export default function Topbar({ onMenu }) {
  const { state, setFilter, dispatch, openSnapshot, theme, toggleTheme } = useApp()
  const query = state.filters.search

  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const debounceRef = useRef(null)
  const suppressRef = useRef(false)
  const wrapRef = useRef(null)

  // Debounced autocomplete: top 5 matches while typing
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (suppressRef.current) {
      suppressRef.current = false
      setSuggestions([])
      setOpen(false)
      return
    }
    const q = (query || '').trim()
    if (!q) {
      setSuggestions([])
      setOpen(false)
      setHighlight(-1)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await employeeService.getEmployees({ search: q, size: 5 })
        setSuggestions(data.content)
        setOpen(true)
        setHighlight(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      }
    }, 200)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goToDirectory = () => {
    setOpen(false)
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })
  }

  const pick = (emp) => {
    suppressRef.current = true
    setOpen(false)
    setFilter('search', emp.fullName)
    openSnapshot(emp.id)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); setHighlight(-1); return }
    if (!open || suggestions.length === 0) return
    const footer = suggestions.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h >= footer ? 0 : h + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h <= 0 ? footer : h - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && highlight < suggestions.length) pick(suggestions[highlight])
      else if (highlight === footer) goToDirectory()
    }
  }

  return (
    <header className="topbar">
      <button className="icon-btn hamburger" onClick={onMenu} aria-label="Open menu">
        <Menu size={17} />
      </button>
      <div className="topbar-title">
        <h1>Workforce Dashboard</h1>
        <span className="caption">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <div className="search-wrap" ref={wrapRef}>
        <Search size={15} />
        <input
          className="input"
          type="search"
          placeholder="Search name, email, role…"
          aria-label="Search employees"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => setFilter('search', e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        />
        {open && (
          <div className="suggestions" role="listbox">
            {suggestions.length === 0 ? (
              <div className="sug-empty">No matches for &ldquo;{query}&rdquo;</div>
            ) : (
              <>
                {suggestions.map((emp, i) => (
                  <button
                    key={emp.id}
                    type="button"
                    role="option"
                    aria-selected={highlight === i}
                    className={`sug-item${highlight === i ? ' active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); pick(emp) }}
                    onMouseEnter={() => setHighlight(i)}
                  >
                    <Avatar name={emp.fullName} code={emp.employeeCode} size={30} />
                    <span className="sug-meta">
                      <strong>{emp.fullName}</strong>
                      <span className="caption">{emp.role} · {prettyEnum(emp.department)}</span>
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`sug-item sug-footer${highlight === suggestions.length ? ' active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); goToDirectory() }}
                  onMouseEnter={() => setHighlight(suggestions.length)}
                >
                  See all results in directory ↓
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <button
        className="icon-btn theme-btn"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle light and dark theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <button className="btn btn-primary btn-add-emp" onClick={() => dispatch({ type: 'SET_ADD_MODAL', value: true })}>
        <Plus size={15} /> Add Employee
      </button>
      <div className="avatar-circle" title="HR Admin" aria-label="HR Admin profile">HR</div>
    </header>
  )
}
