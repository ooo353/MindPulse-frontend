import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock the userApi module to avoid axios/network calls
vi.mock('@/api/userApi', () => ({
  userApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    uploadAvatar: vi.fn(),
  }
}))

describe('useUserStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('should have null token by default when localStorage is empty', () => {
    const store = useUserStore()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('should set token and user after setUser()', () => {
    const store = useUserStore()
    store.setUser(
      { username: 'testuser', email: 'test@example.com', role: 'ROLE_USER' },
      'jwt-token-abc123'
    )
    expect(store.token).toBe('jwt-token-abc123')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.username).toBe('testuser')
    expect(store.user?.email).toBe('test@example.com')
  })

  it('should clear token and user after logout()', () => {
    const store = useUserStore()
    store.setUser(
      { username: 'testuser', email: 'test@example.com', role: 'ROLE_USER' },
      'jwt-token-abc123'
    )
    store.logout()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(store.profile).toBeNull()
  })

  it('should restore user from localStorage on creation', () => {
    localStorageMock.setItem('token', 'stored-token')
    localStorageMock.setItem('user', JSON.stringify({
      username: 'storeduser',
      email: 'stored@example.com',
      role: 'ROLE_USER'
    }))

    const store = useUserStore()
    store.restoreUserFromStorage()

    expect(store.token).toBe('stored-token')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.username).toBe('storeduser')
  })

  it('isAdmin should be true when user role is ROLE_ADMIN', () => {
    const store = useUserStore()
    store.setUser(
      { username: 'admin', email: 'admin@example.com', role: 'ROLE_ADMIN' },
      'admin-token'
    )
    expect(store.isAdmin).toBe(true)
  })

  it('isAdmin should be false when user role is ROLE_USER', () => {
    const store = useUserStore()
    store.setUser(
      { username: 'user', email: 'user@example.com', role: 'ROLE_USER' },
      'user-token'
    )
    expect(store.isAdmin).toBe(false)
  })

  it('isAdmin should be false when user has no role', () => {
    const store = useUserStore()
    store.setUser(
      { username: 'norole', email: 'norole@example.com' },
      'token'
    )
    expect(store.isAdmin).toBe(false)
  })

  it('should handle corrupted localStorage gracefully', () => {
    localStorageMock.setItem('token', 'some-token')
    localStorageMock.setItem('user', 'not-valid-json')

    const store = useUserStore()
    store.restoreUserFromStorage()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
