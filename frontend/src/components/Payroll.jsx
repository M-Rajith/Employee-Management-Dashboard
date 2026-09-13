import React, { useState } from 'react'
import { Pencil, Wallet, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { formatINR } from '../utils/format'
import Avatar from './Avatar'
import { EmptyState, Spinner } from './States'
import PayrollModal from './PayrollModal'

export default function Payroll() {
  const { state } = useApp()
  const { payroll, payrollLoading } = state
  const [modal, setModal] = useState({ open: false, row: null })
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)

  const totalNet = payroll.reduce((sum, row) => sum + row.netSalary, 0)
  const totalPages = Math.max(1, Math.ceil(payroll.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const visible = payroll.slice(safePage * pageSize, safePage * pageSize + pageSize)

  return (
    <section className="section" id="payroll" aria-label="Payroll">
      <div className="section-head">
        <div>
          <h2>Payroll</h2>
          <p className="caption">
            {payroll.length} salaried employees · total net {formatINR(totalNet)}/month
          </p>
        </div>
      </div>

      {payrollLoading ? (
        <div className="glass card"><Spinner large /></div>
      ) : payroll.length === 0 ? (
        <div className="glass card">
          <EmptyState icon={Wallet} title="No payroll records" message="Open an employee's snapshot to verify they exist, then add their salary." />
        </div>
      ) : (
        <div className="glass table-wrap">
          <table className="emp-table payroll-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="num">Basic</th><th className="num">HRA</th>
                <th className="num">Allowances</th><th className="num">Deductions</th>
                <th className="num">Net / month</th><th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} onClick={() => setModal({ open: true, row })}
                  onKeyDown={(e) => e.key === 'Enter' && setModal({ open: true, row })} tabIndex={0}>
                  <td>
                    <div className="payroll-emp">
                      <Avatar name={row.employeeName} code={row.employeeCode} size={34} />
                      <div className="meta">
                        <strong>{row.employeeName}</strong>
                        <span className="caption">{row.role} · {row.team}</span>
                      </div>
                    </div>
                  </td>
                  <td className="num muted">{formatINR(row.basic)}</td>
                  <td className="num muted">{formatINR(row.hra)}</td>
                  <td className="num muted">{formatINR(row.allowances)}</td>
                  <td className="num muted">{formatINR(row.deductions)}</td>
                  <td className="num payroll-net">{formatINR(row.netSalary)}</td>
                  <td>
                    <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setModal({ open: true, row }) }}>
                      <Pencil size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payroll.length > 5 && (
        <div className="pagination">
          <span className="page-info">
            Page {safePage + 1} of {totalPages} · {payroll.length} records
          </span>
          <select className="select" style={{ width: 'auto' }} value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
            aria-label="Rows per page">
            {[5, 10, 20].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <button className="btn btn-sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft size={14} /> Prev
          </button>
          <button className="btn btn-sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {modal.open && (
        <PayrollModal row={modal.row} onClose={() => setModal({ open: false, row: null })} />
      )}
    </section>
  )
}
