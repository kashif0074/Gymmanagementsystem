import { api } from './client'

export type Member = {
  id: string
  name: string
  username: string
  email: string
  phone: string
  plan: string
  status: string
  joinedAt: string
  renewsAt?: string | null
  age?: number | null
  gender?: string | null
  trainerId?: string | null
  trainerName?: string | null
}

export type Trainer = {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  experienceYears: number
  status: string
  ratePerSession: number
  bio?: string | null
  showOnPublicSite?: boolean
}

export type Payment = {
  id: string
  memberId: string
  memberName: string
  amount: number
  method: string
  status: string
  forPlan: string
  createdAt: string
  note: string
}

export type AttendanceRecord = {
  id: string
  memberId: string
  memberName: string
  date: string
  checkIn: string
  checkOut: string
  note: string
}

export type PublicPlan = {
  id: string
  title: string
  price: string
  note?: string | null
  features: string[]
  highlight: boolean
}

export type PublicTrainer = {
  name: string
  specialization: string
  experience: string
  bio: string
}

export type ScheduleEntry = {
  id: string
  day: string
  morning: string
  evening: string
  sortOrder: number
}

export type GymSettings = {
  gymName: string
  contactEmail: string
  contactPhone: string
  address: string
  hours: string
  currency: string
  notifications: {
    expiringMemberships: boolean
    paymentPending: boolean
  }
  access: {
    adminPinEnabled: boolean
    adminPin: string
  }
  membershipPlans: { name: string; price: number }[]
}

export type PublicSettings = {
  gymName: string
  contactEmail: string
  contactPhone: string
  address: string
  hours: string
  currency: string
}

export type DashboardStats = {
  totalMembers: number
  activeMembers: number
  totalTrainers: number
  pendingPayments: number
  totalRevenue: number
  todayAttendance: number
}

export type MemberProfile = {
  member: Member
  payments: Payment[]
  attendance: AttendanceRecord[]
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

export type LoginResponse = {
  success: boolean
  message?: string | null
  role?: string | null
  displayName?: string | null
  token?: string | null
}

export const membersApi = {
  list: () => api.get<Member[]>('/members'),
  profile: (username: string) =>
    api.get<MemberProfile>(`/members/profile/${encodeURIComponent(username)}`),
  create: (member: Omit<Member, 'id' | 'joinedAt'> & { joinedAt?: string }) =>
    api.post<Member>('/members', member),
  update: (id: string, member: Partial<Member>) => api.put<Member>(`/members/${id}`, member),
  updateProfile: (profile: {
    name: string
    email: string
    phone: string
    age?: number | null
    gender?: string | null
    password?: string
  }) => api.put<Member>('/members/profile', profile),
  selectPlan: (planName: string) => api.post<Member>('/members/select-plan', { planName }),
  joinTrainer: (trainerId: string) => api.post<Member>('/members/join-trainer', { trainerId }),
  remove: (id: string) => api.delete(`/members/${id}`),
}

export const trainersApi = {
  list: (publicOnly = false) =>
    api.get<Trainer[]>(`/trainers${publicOnly ? '?publicOnly=true' : ''}`),
  create: (trainer: Omit<Trainer, 'id'>) => api.post<Trainer>('/trainers', trainer),
  update: (id: string, trainer: Partial<Trainer>) => api.put<Trainer>(`/trainers/${id}`, trainer),
  remove: (id: string) => api.delete(`/trainers/${id}`),
}

export const paymentsApi = {
  list: () => api.get<Payment[]>('/payments'),
  create: (payment: Omit<Payment, 'id'>) => api.post<Payment>('/payments', payment),
  update: (id: string, payment: Partial<Payment>) => api.put<Payment>(`/payments/${id}`, payment),
  remove: (id: string) => api.delete(`/payments/${id}`),
}

export const attendanceApi = {
  list: () => api.get<AttendanceRecord[]>('/attendance'),
  create: (record: Omit<AttendanceRecord, 'id'>) => api.post<AttendanceRecord>('/attendance', record),
  update: (id: string, record: Partial<AttendanceRecord>) =>
    api.put<AttendanceRecord>(`/attendance/${id}`, record),
  checkin: () => api.post<AttendanceRecord>('/attendance/checkin', {}),
  checkout: () => api.post<AttendanceRecord>('/attendance/checkout', {}),
  remove: (id: string) => api.delete(`/attendance/${id}`),
}

export const plansApi = {
  list: () => api.get<PublicPlan[]>('/plans'),
}

export const scheduleApi = {
  list: () => api.get<ScheduleEntry[]>('/schedule'),
  update: (id: string, entry: Partial<ScheduleEntry>) =>
    api.put<ScheduleEntry>(`/schedule/${id}`, entry),
}

export const settingsApi = {
  get: () => api.get<GymSettings>('/settings'),
  getPublic: () => api.get<PublicSettings>('/settings/public'),
  update: (settings: GymSettings) => api.put<GymSettings>('/settings', settings),
}

export const authApi = {
  login: (username: string, password: string, mode: 'member' | 'admin') =>
    api.post<LoginResponse>('/auth/login', { username, password, mode }),
}

export const registrationsApi = {
  submit: (data: {
    name: string
    username: string
    password: string
    age: number
    gender: string
    phone: string
    plan: string
  }) => api.post<Member>('/registrations', data),
}

export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) =>
    api.post('/contact', data),
  list: () => api.get<ContactMessage[]>('/contact'),
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
  publicStats: () => api.get<{ totalMembers: number; totalTrainers: number }>('/dashboard/public-stats'),
}
