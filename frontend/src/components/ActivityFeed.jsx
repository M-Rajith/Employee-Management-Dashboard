import React from 'react'
import { UserPlus, UserMinus, UserCog, CheckCircle2, XCircle, Clock, RefreshCcw, Briefcase, FolderKanban, Inbox } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { timeAgo } from '../utils/format'
import { EmptyState } from './States'

const TYPE_ICON = {
  EMPLOYEE_ADDED: UserPlus,
  EMPLOYEE_UPDATED: UserCog,
  PROFILE_UPDATED: RefreshCcw,
  LEAVE_APPROVED: CheckCircle2,
  LEAVE_REJECTED: XCircle,
  ATTENDANCE_RECORDED: Clock,
  POSITION_ADDED: Briefcase,
  POSITION_UPDATED: Briefcase,
  PROJECT_CREATED: FolderKanban,
  PROJECT_MEMBER_ADDED: UserPlus,
  PROJECT_MEMBER_REMOVED: UserMinus,
  EMPLOYEE_REMOVED: UserMinus,
}

export default function ActivityFeed() {
  const { state } = useApp()
  const { activities, activitiesLoading } = state

  return (
    <div className="glass card">
      <div className="section-head">
        <div>
          <h2>Recent Activity</h2>
          <p className="caption">Latest workforce events</p>
        </div>
      </div>
      {activitiesLoading ? (
        <div className="skeleton" style={{ height: 180 }} />
      ) : activities.length === 0 ? (
        <EmptyState icon={Inbox} title="No recent activity" message="Workforce events will appear here." />
      ) : (
        activities.map((a) => {
          const Icon = TYPE_ICON[a.activityType] || Clock
          return (
            <div className="activity-item" key={a.id}>
              <div className="activity-icon"><Icon size={15} /></div>
              <div style={{ minWidth: 0 }}>
                <div className="act-msg">{a.message}</div>
                <span className="caption">{timeAgo(a.createdAt)}</span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
