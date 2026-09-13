import React, { useEffect, useState } from 'react'
import { Plus, Trash2, FolderKanban, X, UserPlus } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { prettyEnum, formatDateTime } from '../utils/format'
import Avatar from './Avatar'
import { EmptyState, Spinner } from './States'
import { employeeService } from '../services/employeeService'
import ProjectModal from './ProjectModal'

function weightBadge(w) {
  return w === 'LOW' ? 'badge-w-low' : w === 'MEDIUM' ? 'badge-w-medium' : 'badge-w-high'
}

export default function Projects() {
  const { state, addMember, removeMember, deleteProject, toast } = useApp()
  const { projects, projectsLoading } = state
  const [modalOpen, setModalOpen] = useState(false)
  const [addTo, setAddTo] = useState(null) // project receiving a new member
  const [candidates, setCandidates] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!addTo) return
    employeeService.getEmployees({ size: 100 })
      .then((data) => setCandidates(data.content))
      .catch(() => setCandidates([]))
  }, [addTo])

  const doRemove = async (project, member) => {
    setBusy(true)
    try { await removeMember(project.id, member.employeeId) }
    catch (err) { toast(err.message, 'error') }
    finally { setBusy(false) }
  }

  const doDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}" and its team?`)) return
    setBusy(true)
    try { await deleteProject(project.id) }
    catch (err) { toast(err.message, 'error') }
    finally { setBusy(false) }
  }

  const doAdd = async (project, employee) => {
    setBusy(true)
    try {
      await addMember(project.id, employee.id)
      setAddTo(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const memberIds = addTo ? addTo.members.map((m) => m.employeeId) : []
  const addable = candidates.filter((e) => !memberIds.includes(e.id))

  return (
    <section className="section" id="projects" aria-label="Projects">
      <div className="section-head">
        <div>
          <h2>Projects</h2>
          <p className="caption">Auto-assembled teams by weightage &amp; experience — fully editable</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> New Project
        </button>
      </div>

      {projectsLoading ? (
        <div className="glass card"><Spinner large /></div>
      ) : projects.length === 0 ? (
        <div className="glass card">
          <EmptyState icon={FolderKanban} title="No projects yet"
            message="Create one — the team assembles itself from experience." />
        </div>
      ) : (
        projects.map((proj) => (
          <div className="glass card leave-card hoverable" key={proj.id}>
            <span className="kpi-icon" style={{ width: 38, height: 38, flexShrink: 0 }}><FolderKanban size={16} /></span>
            <div className="leave-meta" style={{ flex: '1 1 100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <strong>{proj.name}</strong>
                <span className={`badge ${weightBadge(proj.weightage)}`}>{prettyEnum(proj.weightage)}</span>
              </div>
              <span className="caption">
                {proj.members.length} members · created {formatDateTime(proj.createdAt)}
              </span>
              <div className="proj-members">
                {proj.members.map((m) => (
                  <span className="proj-member" key={m.employeeId}>
                    <Avatar name={m.fullName} code={m.employeeCode} size={22} />
                    <span>{m.fullName}</span>
                    <span className={`proj-role${m.memberRole === 'Lead' ? ' lead' : ''}`}>{m.memberRole}</span>
                    <button className="x" disabled={busy} aria-label={`Remove ${m.fullName}`}
                      onClick={() => doRemove(proj, m)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="leave-actions" style={{ justifyContent: 'flex-start' }}>
                <button className="btn btn-sm" disabled={busy} onClick={() => setAddTo(proj)}>
                  <UserPlus size={13} /> Add member
                </button>
                <button className="btn btn-sm btn-danger-ghost" disabled={busy} onClick={() => doDelete(proj)}>
                  <Trash2 size={13} /> Delete project
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {modalOpen && <ProjectModal onClose={() => setModalOpen(false)} />}

      {addTo && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setAddTo(null)}>
          <div className="glass modal" style={{ width: 'min(440px, 100%)' }} role="dialog"
            aria-modal="true" aria-label="Add member">
            <div className="section-head">
              <h2>Add member — {addTo.name}</h2>
              <button className="icon-btn" onClick={() => setAddTo(null)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            {addable.length === 0 ? (
              <p className="caption">Every employee is already on this project.</p>
            ) : (
              <div className="att-history-list" style={{ maxHeight: 320 }}>
                {addable.map((emp) => (
                  <button key={emp.id} type="button" className="sug-item" disabled={busy}
                    onClick={() => doAdd(addTo, emp)}>
                    <Avatar name={emp.fullName} code={emp.employeeCode} size={28} />
                    <span className="sug-meta">
                      <strong>{emp.fullName}</strong>
                      <span className="caption">{emp.role} · {emp.team}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <p className="caption" style={{ marginTop: 8 }}>Project role is auto-assigned from experience.</p>
          </div>
        </div>
      )}
    </section>
  )
}
