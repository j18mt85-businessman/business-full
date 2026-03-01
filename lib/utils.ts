import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Georgian Lari
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ka-GE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} \u20BE`
}

// Format date in Georgian locale
export function formatDate(dateStr: string, options?: { time?: boolean }): string {
  const date = new Date(dateStr)
  const dateFormatted = date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  if (options?.time) {
    const timeFormatted = date.toLocaleTimeString('ka-GE', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateFormatted} ${timeFormatted}`
  }
  return dateFormatted
}

// Generate a simple unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Format receipt number
export function formatReceiptNumber(num: number): string {
  return `R-${String(num).padStart(6, '0')}`
}

// Calculate time elapsed (Georgian)
export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return `${seconds} წამის წინ`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} წუთის წინ`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} საათის წინ`
  const days = Math.floor(hours / 24)
  return `${days} დღის წინ`
}

// Payment method labels
export function getPaymentLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'ნაღდი',
    card: 'ბარათი',
    transfer: 'გადარიცხვა',
    mixed: 'შერეული',
  }
  return labels[method] || method
}

// Status labels
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'დასრულებული',
    returned: 'დაბრუნებული',
    partial_return: 'ნაწილობრივი',
    open: 'გახსნილი',
    closed: 'დახურული',
  }
  return labels[status] || status
}
