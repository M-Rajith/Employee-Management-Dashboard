import React, { createContext, useContext, useEffect, useReducer, useRef, useCallback, useState } from 'react'
import { employeeService } from '../services/employeeService'
import { leaveService } from '../services/leaveService'
import { attendanceService } from '../services/attendanceService'
import { dashboardService } from '../services/dashboardService'
import { activityService } from '../services/activityService'
import { positionService } from '../services/positionService'
import { payrollService } from '../services/payrollService'
import { projectService } from '../services/projectService'

const AppContext = createContext(null)

const initialState = {
  dashboard: null,
  insights: [],
  employees: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
  filters: { search: '', department: '', status: '', location: '', team: '', sort: 'firstName,asc' },
  pendingLeaves: [],
  attendance: { range: 'week', days: [] },
  activities: [],
  positions: [],
  positionsLoading: true,
  payroll: [],
  payrollLoading: true,
  projects: [],
  projectsLoading: true,
  snapshot: null,
  drawerOpen: false,
  snapshotLoading: false,
  employeesLoading: true,
  leavesLoading: true,
  attendanceLoading: true,
  activitiesLoading: true,
  dashboardLoading: true,
  employeesError: '',
  leavesError: '',
  attendanceError: '',
  toasts: [],
  addModalOpen: false,
}

let toastId = 0

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DASHBOARD':
      return { ...state, dashboard: action.value, dashboardLoading: false }
    case 'SET_INSIGHTS':
      return { ...state, insights: action.value }
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.value, employeesLoading: false, employeesError: '' }
    case 'EMPLOYEES_ERROR':
      return { ...state, employeesLoading: false, employeesError: action.value }
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value }, employeesLoading: true }
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        employeesLoading: true,
      }
    case 'SET_EMPLOYEES_PAGE':
      return { ...state, employeesLoading: true, employees: { ...state.employees, page: action.value } }
    case 'SET_PENDING_LEAVES':
      return { ...state, pendingLeaves: action.value, leavesLoading: false, leavesError: '' }
    case 'LEAVES_ERROR':
      return { ...state, leavesLoading: false, leavesError: action.value }
    case 'REMOVE_PENDING_LEAVE':
      return { ...state, pendingLeaves: state.pendingLeaves.filter((l) => l.id !== action.value) }
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.value, attendanceLoading: false, attendanceError: '' }
    case 'ATTENDANCE_ERROR':
      return { ...state, attendanceLoading: false, attendanceError: action.value }
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.value, activitiesLoading: false }
    case 'SET_POSITIONS':
      return { ...state, positions: action.value, positionsLoading: false }
    case 'SET_PAYROLL':
      return { ...state, payroll: action.value, payrollLoading: false }
    case 'SET_PROJECTS':
      return { ...state, projects: action.value, projectsLoading: false }
    case 'SET_SNAPSHOT':
      return { ...state, snapshot: action.value, snapshotLoading: false }
    case 'SNAPSHOT_LOADING':
      return { ...state, snapshotLoading: true }
    case 'OPEN_DRAWER':
      return { ...state, drawerOpen: true }
    case 'CLOSE_DRAWER':
      return { ...state, drawerOpen: false }
    case 'SET_ADD_MODAL':
      return { ...state, addModalOpen: action.value }
    case 'PUSH_TOAST':
      return { ...state, toasts: [...state.toasts, action.value] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.value) }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const debounceRef = useRef(null)

  // ---- theme: persisted in localStorage, applied to <html data-theme> ----
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('peopleos-theme') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('peopleos-theme', theme) } catch { /* storage unavailable */ }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId
    dispatch({ type: 'PUSH_TOAST', value: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', value: id }), 4200)
  }, [])

  // ---------- loaders ----------
  const loadDashboard = useCallback(async () => {
    try {
      dispatch({ type: 'SET_DASHBOARD', value: await dashboardService.getDashboard() })
    } catch { /* dashboard errors surface via empty states */ }
    try {
      dispatch({ type: 'SET_INSIGHTS', value: await dashboardService.getInsights() || [] })
    } catch { /* insights are non-critical */ }
  }, [])

  const loadEmployees = useCallback(async (filters, page) => {
    try {
      const data = await employeeService.getEmployees({ ...filters, page })
      dispatch({ type: 'SET_EMPLOYEES', value: data })
    } catch (err) {
      dispatch({ type: 'EMPLOYEES_ERROR', value: err.message })
    }
  }, [])

  const loadLeaves = useCallback(async () => {
    try {
      dispatch({ type: 'SET_PENDING_LEAVES', value: await leaveService.getPendingLeaves() })
    } catch (err) {
      dispatch({ type: 'LEAVES_ERROR', value: err.message })
    }
  }, [])

  const loadAttendance = useCallback(async (range) => {
    try {
      const data = await attendanceService.getAttendance(range)
      dispatch({ type: 'SET_ATTENDANCE', value: { range: data.range, days: data.days } })
    } catch (err) {
      dispatch({ type: 'ATTENDANCE_ERROR', value: err.message })
    }
  }, [])

  const loadActivities = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ACTIVITIES', value: await activityService.getActivities() })
    } catch { /* non-critical */ }
  }, [])

  const loadPositions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_POSITIONS', value: await positionService.getPositions() })
    } catch { /* non-critical */ }
  }, [])

  const loadPayroll = useCallback(async () => {
    try {
      dispatch({ type: 'SET_PAYROLL', value: await payrollService.getPayroll() })
    } catch { /* non-critical */ }
  }, [])

  const loadProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_PROJECTS', value: await projectService.getProjects() })
    } catch { /* non-critical */ }
  }, [])

  // ---------- initial load ----------
  useEffect(() => {
    loadDashboard()
    loadLeaves()
    loadAttendance('week')
    loadActivities()
    loadPositions()
    loadPayroll()
    loadProjects()
  }, [loadDashboard, loadLeaves, loadAttendance, loadActivities, loadPositions, loadPayroll, loadProjects])

  // ---------- reactive: search / filter / sort / page changes refetch employees ----------
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadEmployees(state.filters, state.employees.page)
    }, state.filters.search ? 300 : 0)
    return () => clearTimeout(debounceRef.current)
  }, [state.filters, state.employees.page, loadEmployees])

  // ---------- actions ----------
  const setFilter = (key, value) => {
    if (key !== 'search') dispatch({ type: 'SET_EMPLOYEES_PAGE', value: 0 })
    else dispatch({ type: 'SET_EMPLOYEES_PAGE', value: 0 })
    dispatch({ type: 'SET_FILTER', key, value })
  }

  const setPage = (page) => dispatch({ type: 'SET_EMPLOYEES_PAGE', value: page })

  const refreshCore = useCallback(() => {
    loadDashboard()
    loadLeaves()
    loadActivities()
  }, [loadDashboard, loadLeaves, loadActivities])

  const addEmployee = async (form) => {
    await employeeService.createEmployee(form)
    toast('Employee added successfully')
    dispatch({ type: 'SET_ADD_MODAL', value: false })
    loadEmployees(state.filters, 0)
    refreshCore()
  }

  const approveLeave = async (id) => {
    await leaveService.approveLeave(id)
    dispatch({ type: 'REMOVE_PENDING_LEAVE', value: id })
    toast('Leave approved')
    refreshCore()
  }

  const rejectLeave = async (id) => {
    await leaveService.rejectLeave(id)
    dispatch({ type: 'REMOVE_PENDING_LEAVE', value: id })
    toast('Leave rejected', 'info')
    refreshCore()
  }

  const setAttendanceRange = (range) => loadAttendance(range)

  const openSnapshot = async (id) => {
    dispatch({ type: 'SNAPSHOT_LOADING' })
    dispatch({ type: 'OPEN_DRAWER' })
    try {
      dispatch({ type: 'SET_SNAPSHOT', value: await employeeService.getSnapshot(id) })
    } catch (err) {
      dispatch({ type: 'CLOSE_DRAWER' })
      toast(err.message, 'error')
    }
  }

  const closeSnapshot = () => dispatch({ type: 'CLOSE_DRAWER' })

  const savePosition = async (form, id) => {
    if (id) {
      await positionService.updatePosition(id, form)
      toast('Position updated')
    } else {
      await positionService.createPosition(form)
      toast('Position added')
    }
    loadPositions()
    refreshCore()
  }

  const createProject = async (payload) => {
    const created = await projectService.createProject(payload)
    toast(`Project created — ${created.members.length}-person team assembled`)
    loadProjects()
    refreshCore()
  }

  const addMember = async (projectId, employeeId) => {
    await projectService.addMember(projectId, employeeId)
    toast('Member added')
    loadProjects()
    refreshCore()
  }

  const removeMember = async (projectId, employeeId) => {
    await projectService.removeMember(projectId, employeeId)
    toast('Member removed', 'info')
    loadProjects()
    refreshCore()
  }

  const deleteProject = async (id) => {
    await projectService.deleteProject(id)
    toast('Project deleted', 'info')
    loadProjects()
    refreshCore()
  }

  const savePayroll = async (employeeId, amounts) => {
    await payrollService.savePayroll(employeeId, amounts)
    toast('Payroll saved')
    loadPayroll()
    refreshCore()
  }

  const deletePosition = async (id) => {
    await positionService.deletePosition(id)
    toast('Position removed', 'info')
    loadPositions()
    refreshCore()
  }

  const value = {
    state, dispatch, toast,
    setFilter, setPage, addEmployee, approveLeave, rejectLeave,
    setAttendanceRange, openSnapshot, closeSnapshot,
    refreshCore, theme, toggleTheme,
    loadPositions, savePosition, deletePosition,
    loadPayroll, savePayroll,
    createProject, addMember, removeMember, deleteProject,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
