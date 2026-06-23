/**
 * Format a date string or Date object to a localized date string.
 * @param date - ISO date string, Date object, or undefined/null
 * @param locale - BCP 47 locale tag (default: 'zh-CN')
 * @returns Formatted date string, or '无' if input is falsy
 */
export function formatDate(
  date: string | Date | undefined | null,
  locale = 'zh-CN'
): string {
  if (!date) return '无'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '无效日期'
  return d.toLocaleDateString(locale)
}

/**
 * Format a duration in milliseconds to a human-readable string.
 * Examples: 5000 -> "5秒", 120000 -> "2分钟", 3700000 -> "1小时1分钟"
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0秒'
  if (ms < 1000) return `${ms}毫秒`

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}天`)
  if (hours % 24 > 0) parts.push(`${hours % 24}小时`)
  if (minutes % 60 > 0) parts.push(`${minutes % 60}分钟`)
  if (seconds % 60 > 0 && parts.length < 2) parts.push(`${seconds % 60}秒`)

  return parts.length > 0 ? parts.join('') : '0秒'
}
