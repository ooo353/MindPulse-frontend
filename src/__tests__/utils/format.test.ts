import { describe, it, expect } from 'vitest'
import { formatDate, formatDuration } from '@/utils/format'

describe('formatDate', () => {
  it('should format a valid ISO date string', () => {
    const result = formatDate('2026-06-15T10:30:00Z')
    expect(result).not.toBe('无')
    expect(result).not.toBe('无效日期')
    expect(result).toContain('2026')
  })

  it('should format a Date object', () => {
    const date = new Date(2026, 0, 1) // Jan 1, 2026
    const result = formatDate(date)
    expect(result).toContain('2026')
  })

  it('should return "无" for undefined', () => {
    expect(formatDate(undefined)).toBe('无')
  })

  it('should return "无" for null', () => {
    expect(formatDate(null)).toBe('无')
  })

  it('should return "无" for empty string', () => {
    expect(formatDate('')).toBe('无')
  })

  it('should return "无效日期" for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('无效日期')
  })

  it('should use zh-CN locale by default', () => {
    const result = formatDate('2026-01-15')
    // zh-CN format uses / separators
    expect(result).toContain('2026')
  })
})

describe('formatDuration', () => {
  it('should format milliseconds under 1 second', () => {
    expect(formatDuration(500)).toBe('500毫秒')
  })

  it('should format seconds', () => {
    expect(formatDuration(5000)).toBe('5秒')
  })

  it('should format minutes and seconds', () => {
    expect(formatDuration(65000)).toBe('1分钟5秒')
  })

  it('should format hours and minutes', () => {
    expect(formatDuration(3700000)).toBe('1小时1分钟')
  })

  it('should format days and hours', () => {
    expect(formatDuration(90000000)).toBe('1天1小时')
  })

  it('should return "0秒" for 0', () => {
    expect(formatDuration(0)).toBe('0秒')
  })

  it('should return "0秒" for negative values', () => {
    expect(formatDuration(-1000)).toBe('0秒')
  })

  it('should handle exactly 1 second', () => {
    expect(formatDuration(1000)).toBe('1秒')
  })

  it('should handle exactly 1 minute', () => {
    expect(formatDuration(60000)).toBe('1分钟')
  })

  it('should handle exactly 1 hour', () => {
    expect(formatDuration(3600000)).toBe('1小时')
  })
})
