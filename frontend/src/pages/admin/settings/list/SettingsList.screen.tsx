import { useMemo, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockContent } from '@/components/common'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Badge } from '@/components/ui'
import { useToast } from '@/components/common'
import { useAdminSettings, useUpdateSettings } from '../hooks/useSettings'
import { SETTINGS_CATEGORY_LABELS } from '@/types/settings.types'
import type { SystemSettingItem, SystemSettingsUpdatePayload } from '@/types/settings.types'
import { cn } from '@/lib/utils'
import { Settings2, Loader2, Info, RotateCcw, Users, FileText, FolderKanban, Shield, UserCheck, FileCheck, Calendar, Target, Award, MessageSquare, Lock, Search as SearchIcon, Monitor, Clock } from 'lucide-react'

// Category icon mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  groups: Users,
  proposals: FileText,
  projects: FolderKanban,
  committees: Shield,
  supervisors: UserCheck,
  documents: FileCheck,
  meetings: Calendar,
  milestones: Target,
  evaluations: Award,
  requests: MessageSquare,
  authentication: Lock,
  ui: Monitor,
  periods: Clock,
}

function groupByCategory(settings: SystemSettingItem[]): Record<string, SystemSettingItem[]> {
  const groups: Record<string, SystemSettingItem[]> = {}
  for (const s of settings) {
    const cat = s.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(s)
  }
  return groups
}

function SettingRow({
  item,
  value,
  onChange,
  onReset,
}: {
  item: SystemSettingItem
  value: number | string
  onChange: (key: string, value: number | string) => void
  onReset: (key: string) => void
}) {
  const { t } = useTranslation()
  const isInteger = item.type === 'integer'
  const numValue = isInteger ? Number(value) : value
  const hasChanged = value !== item.value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (isInteger) {
      const n = parseInt(v, 10)
      if (!Number.isNaN(n)) onChange(item.key, n)
      else onChange(item.key, v as string)
    } else {
      onChange(item.key, v)
    }
  }

  return (
    <div className="group grid gap-3 p-4 rounded-lg bg-muted/20 border border-border/40 hover:border-border hover:bg-muted/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Label htmlFor={item.key} className="text-[sm] font-medium leading-tight">
              {t(`settings.descriptions.${item.key}`, { defaultValue: item.description })}
            </Label>
            {hasChanged && (
              <Badge variant="default" className="text-[10px] h-5 px-1.5">
                {t('settings.modified', { defaultValue: 'Modified' })}
              </Badge>
            )}
            {hasChanged && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                {t('settings.unsavedChanges', { defaultValue: 'Unsaved' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {t('settings.defaultValue', { defaultValue: 'Default', value: item.default })}
              {item.min !== null && item.max !== null && (
                <span className="ml-1">
                  • {t('settings.rangeValue', { defaultValue: 'Range', min: item.min, max: item.max })}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanged && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReset(item.key)}
              className="h-8 w-8 p-0"
              title={t('settings.resetToDefault', { defaultValue: 'Reset to default' })}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          id={item.key}
          type={isInteger ? 'number' : 'text'}
          min={item.min ?? undefined}
          max={item.max ?? undefined}
          value={numValue}
          onChange={handleChange}
          className="max-w-full lg:max-w-xs h-9"
        />
      </div>
    </div>
  )
}

export function SettingsListScreen() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const { data: settings = [], isLoading, error } = useAdminSettings()
  const updateMutation = useUpdateSettings()

  const [localValues, setLocalValues] = useState<SystemSettingsUpdatePayload>(() => ({}))
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('')

  const hasChanges = useMemo(() => {
    if (Object.keys(localValues).length === 0) return false
    return settings.some((s) => {
      const v = localValues[s.key]
      return v !== undefined && v !== s.value
    })
  }, [localValues, settings])

  const changedCount = useMemo(() => {
    return Object.keys(localValues).filter(key => {
      const setting = settings.find(s => s.key === key)
      return setting && localValues[key] !== setting.value
    }).length
  }, [localValues, settings])

  const getValue = useCallback(
    (item: SystemSettingItem): number | string => {
      if (localValues[item.key] !== undefined) return localValues[item.key] as number | string
      return item.value as number | string
    },
    [localValues]
  )

  const handleChange = useCallback((key: string, value: number | string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback((key: string) => {
    setLocalValues((prev) => {
      const newValues = { ...prev }
      delete newValues[key]
      return newValues
    })
  }, [])

  const handleResetAll = useCallback(() => {
    setLocalValues({})
  }, [])

  const handleSave = async () => {
    if (!hasChanges) return
    const payload: SystemSettingsUpdatePayload = {}
    settings.forEach((s) => {
      const v = localValues[s.key] !== undefined ? localValues[s.key] : s.value
      payload[s.key] = v
    })
    try {
      await updateMutation.mutateAsync(payload)
      setLocalValues({})
      toastSuccess(t('settings.saveSuccess', { defaultValue: 'Settings saved successfully' }))
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toastError(msg || t('settings.saveError', { defaultValue: 'Failed to save settings' }))
    }
  }

  const grouped = useMemo(() => groupByCategory(settings), [settings])

  const categories = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      const orderMap: Record<string, number> = {
        groups: 1,
        proposals: 2,
        projects: 3,
        supervisors: 4,
        committees: 5,
        documents: 6,
        meetings: 7,
        milestones: 8,
        evaluations: 9,
        requests: 10,
        periods: 11,
        authentication: 12,
        ui: 13,
      }
      return (orderMap[a] || 99) - (orderMap[b] || 99)
    })
  }, [grouped])

  // Set initial active category when data loads
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0])
    }
  }, [categories, activeTab])

  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return grouped

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, SystemSettingItem[]> = {}

    Object.entries(grouped).forEach(([category, items]) => {
      const matchedItems = items.filter(item =>
        item.description.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      )
      if (matchedItems.length > 0) {
        filtered[category] = matchedItems
      }
    })

    return filtered
  }, [grouped, searchQuery])

  if (error) {
    return (
      <BlockContent title={t('settings.title')}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <Info className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('settings.loadError', { defaultValue: 'Failed to load settings' })}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {t('settings.loadErrorDescription', { defaultValue: 'An error occurred while loading the settings. Please try refreshing the page.' })}
          </p>
        </div>
      </BlockContent>
    )
  }

  if (isLoading) {
    return (
      <BlockContent title={t('settings.title')}>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">{t('common.loading', { defaultValue: 'Loading...' })}</p>
        </div>
      </BlockContent>
    )
  }

  const currentItems = activeTab ? (filteredSettings[activeTab] || []) : []

  return (
    <BlockContent title={t('settings.title')}>
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {/* Horizontal tab bar */}
        <nav className="flex flex-row gap-2 p-1.5 overflow-x-auto scrollbar-hide border rounded-lg shrink-0">
          {categories.map((category) => {
            const categoryItems = filteredSettings[category] || []
            const categoryChangedCount = categoryItems.filter((item) => {
              const v = localValues[item.key]
              return v !== undefined && v !== item.value
            }).length

            if (searchQuery && categoryItems.length === 0) return null

            const isActive = activeTab === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveTab(category)}
                className={cn(
                  'shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-md bg-muted/50 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <span>
                  {t(`settings.categories.${category}`, { defaultValue: SETTINGS_CATEGORY_LABELS[category] || category })}
                </span>
                {categoryChangedCount > 0 && (
                  <span
                    className={cn(
                      'inline-block w-2 h-2 rounded-full shrink-0',
                      isActive ? 'bg-primary-foreground' : 'bg-primary'
                    )}
                    aria-hidden
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Main Content area */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Search and Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between  shrink-0">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('settings.searchPlaceholder', { defaultValue: 'Search settings...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasChanges && (
                <>
                  {/* <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {t('settings.changesCount', { defaultValue: `${changedCount} change(s)`, count: changedCount })}
                  </div> */}
                  <Button variant="outline" size="sm" onClick={handleResetAll} className="h-10">
                    <RotateCcw className="size-4" />
                    {t('settings.resetAll', { defaultValue: 'Reset All' })}
                  </Button>
                </>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
                size="sm"
                className="h-10 min-w-[100px]"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('settings.save', { defaultValue: 'Save Changes' })
                )}
              </Button>
            </div>
          </div>

          {searchQuery && Object.keys(filteredSettings).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border bg-muted/20">
              <SearchIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('settings.noResults', { defaultValue: 'No settings found' })}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t('settings.noResultsDescription', { defaultValue: 'Try adjusting your search terms' })}
              </p>
            </div>
          ) : activeTab ? (
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-4! border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md flex items-center gap-3">
                    {/* {(() => {
                      const Icon = CATEGORY_ICONS[activeTab] || Settings2
                      return <Icon className="h-5 w-5 text-primary" />
                    })()} */}
                    <span>
                      {t(`settings.categories.${activeTab}`, { defaultValue: SETTINGS_CATEGORY_LABELS[activeTab] || activeTab })}
                    </span>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {t('settings.settingsCount', { defaultValue: `${currentItems.length} setting(s)`, count: currentItems.length })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentItems.map((item) => (
                    <SettingRow
                      key={item.key}
                      item={item}
                      value={getValue(item)}
                      onChange={handleChange}
                      onReset={handleReset}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border bg-muted/20">
              <Settings2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                {t('settings.selectCategory', { defaultValue: 'Select a category from the tabs above' })}
              </p>
            </div>
          )}
        </main>
      </div>
    </BlockContent>
  )
}
