import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogs } from '@/hooks/useLogs'
import type { LogRow } from '@/types/log'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatLogDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LogCard({
  log,
  expanded,
  onToggle,
}: {
  log: LogRow
  expanded: boolean
  onToggle: () => void
}) {
  const completed = log.exercise_data?.filter((e) => e.completed).length ?? 0
  const total = log.exercise_data?.length ?? 0
  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 text-left"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 text-2xl">{log.feeling ?? '—'}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{formatLogDate(log.created_at)}</p>
            <p className="text-sm text-muted-foreground">
              {completed}/{total} exercises
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-t border-white/10 pt-3">
              {log.exercise_data?.length ? (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {log.exercise_data.map((e, i) => (
                    <li key={i} className={e.completed ? 'text-[#FF007F]' : ''}>
                      {e.completed ? '✓ ' : '○ '}
                      {e.name}
                    </li>
                  ))}
                </ul>
              ) : null}
              {log.notes ? (
                <p className="mt-2 text-sm text-muted-foreground italic">{log.notes}</p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface HistoryViewProps {
  onBack: () => void
}

export function HistoryView({ onBack }: HistoryViewProps) {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { fetchLogs } = useLogs()

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true)
    try {
      const data = await fetchLogs(500)
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        downloadBlob(blob, `corequeen-logs-${new Date().toISOString().slice(0, 10)}.json`)
      } else {
        const headers = ['date', 'feeling', 'notes', 'exercises_completed']
        const rows = data.map((log) => {
          const created = log.created_at ?? ''
          const feeling = log.feeling ?? ''
          const notes = (log.notes ?? '').replace(/"/g, '""')
          const completed = log.exercise_data?.filter((e) => e.completed).length ?? 0
          return `"${created}","${feeling}","${notes}",${completed}`
        })
        const csv = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        downloadBlob(blob, `corequeen-logs-${new Date().toISOString().slice(0, 10)}.csv`)
      }
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetchLogs(50).then((data) => {
      if (!cancelled) {
        setLogs(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [fetchLogs])

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-4 flex min-h-[44px] flex-wrap items-center justify-between gap-2 sm:mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="min-w-0 flex-1 text-center text-lg font-bold text-foreground sm:text-xl">History</h2>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[36px] text-muted-foreground hover:text-[#FF007F]"
            onClick={() => handleExport('json')}
            disabled={exporting || logs.length === 0}
          >
            <Download className="mr-1 size-4" />
            JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[36px] text-muted-foreground hover:text-[#FF007F]"
            onClick={() => handleExport('csv')}
            disabled={exporting || logs.length === 0}
          >
            CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No sessions yet. Log a workout to see it here.</p>
      ) : (
        <ul className="space-y-3 pb-4">
          {logs.map((log) => (
            <li key={log.id ?? log.created_at ?? Math.random()}>
              <LogCard
                log={log}
                expanded={expandedId === (log.id ?? log.created_at ?? '')}
                onToggle={() =>
                  setExpandedId((id) =>
                    id === (log.id ?? log.created_at ?? '') ? null : (log.id ?? log.created_at ?? '')
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
