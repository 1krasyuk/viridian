import {
  ChevronDown,
  ChevronRight,
  Info,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { formatCurrency } from '../shared/formatters'
import { COLUMN_TOOLTIPS, SCENARIO_META } from './constants'
import { formatScenarioPercent, getProbabilityColor } from './formatters'
import type { buildScenarios } from './scenario-model'

type Scenario = ReturnType<typeof buildScenarios>[number]

export function ScenarioTable({
  scenarios,
  currentPrice,
  investment,
  expandedScenario,
  onExpandedScenarioChange,
  isLoading,
}: {
  scenarios: Scenario[]
  currentPrice: number
  investment: number
  expandedScenario: string | null
  onExpandedScenarioChange: (value: string | null) => void
  isLoading: boolean
}) {
  const getPriceColor = (price: number) =>
    price >= currentPrice ? 'text-emerald-500' : 'text-red-500'
  const getValueColor = (value: number) =>
    value >= investment ? 'text-emerald-500' : 'text-red-500'

  return (
    <div className='rounded-xl border border-border/40 overflow-hidden bg-linear-to-b from-card/50 to-background/50'>
      <div className='overflow-x-auto'>
        <div className='min-w-[760px]'>
          <ScenarioTableHeader />
          {isLoading
            ? loadingRows.map((s, i) => (
                <ScenarioLoadingRow key={i} scenario={s} />
              ))
            : scenarios.map((scenario) => {
                const isExpanded = expandedScenario === scenario.type
                return (
                  <ScenarioRow
                    key={scenario.type}
                    scenario={scenario}
                    isExpanded={isExpanded}
                    onToggle={() =>
                      onExpandedScenarioChange(
                        isExpanded ? null : scenario.type,
                      )
                    }
                    getPriceColor={getPriceColor}
                    getValueColor={getValueColor}
                  />
                )
              })}
        </div>
      </div>
    </div>
  )
}

function ScenarioTableHeader() {
  return (
    <div className='grid grid-cols-[160px_1fr_1fr_1fr_90px] gap-3 px-4 py-3 bg-muted/30 border-b border-border/30 text-xs font-medium text-muted-foreground'>
      <HeaderCell label='Scenario' tooltip={COLUMN_TOOLTIPS.scenario} />
      <HeaderCell label='Price' tooltip={COLUMN_TOOLTIPS.priceRange} alignEnd />
      <HeaderCell label='Value' tooltip={COLUMN_TOOLTIPS.valueRange} alignEnd />
      <HeaderCell label='ROI' tooltip={COLUMN_TOOLTIPS.roiRange} alignEnd />
      <HeaderCell label='Prob.' tooltip={COLUMN_TOOLTIPS.probability} alignEnd />
    </div>
  )
}

function HeaderCell({
  label,
  tooltip,
  alignEnd = false,
}: {
  label: string
  tooltip: string
  alignEnd?: boolean
}) {
  return (
    <div className={`flex items-center gap-1 ${alignEnd ? 'justify-end' : ''}`}>
      <span>{label}</span>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className='h-3 w-3 transition-colors shrink-0' />
          </TooltipTrigger>
          <TooltipContent side='top' className='max-w-xs'>
            <p className='text-xs leading-relaxed'>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function ScenarioRow({
  scenario,
  isExpanded,
  onToggle,
  getPriceColor,
  getValueColor,
}: {
  scenario: Scenario
  isExpanded: boolean
  onToggle: () => void
  getPriceColor: (value: number) => string
  getValueColor: (value: number) => string
}) {
  const Icon = scenario.icon
  const meta = SCENARIO_META[scenario.type]
  const borderColor =
    scenario.color === 'red'
      ? 'border-l-2 border-l-red-500/40'
      : scenario.color === 'emerald'
        ? 'border-l-2 border-l-emerald-500/40'
        : 'border-l-2 border-l-blue-500/40'
  const iconColor =
    scenario.color === 'red'
      ? 'text-red-500'
      : scenario.color === 'emerald'
        ? 'text-emerald-500'
        : 'text-blue-500'

  return (
    <div>
      <div
        className={`grid grid-cols-[160px_1fr_1fr_1fr_90px] gap-3 px-4 py-3 border-b border-border/20 items-center hover:bg-muted/20 transition-colors cursor-pointer ${borderColor}`}
        onClick={onToggle}
      >
        <div className='flex items-center gap-2'>
          <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
          <div className='flex flex-col min-w-0'>
            <div className='flex items-center gap-1.5'>
              <span className='text-sm font-bold truncate'>
                {scenario.label}
              </span>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-3 w-3 text-muted-foreground/90 transition-colors shrink-0' />
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-xs'>
                    <p className='text-xs leading-relaxed'>{meta.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className='text-[11px] text-muted-foreground'>
              {scenario.desc}
            </span>
          </div>
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

        <RangeCell
          low={scenario.lowPrice}
          high={scenario.highPrice}
          classNameFor={getPriceColor}
        />
        <RangeCell
          low={scenario.lowValue}
          high={scenario.highValue}
          classNameFor={getValueColor}
        />
        <div className='text-right'>
          <p
            className={`text-sm font-mono font-semibold ${scenario.lowReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {formatScenarioPercent(scenario.lowReturn)}
            <span className='text-muted-foreground/50 mx-1'>→</span>
            {formatScenarioPercent(scenario.highReturn)}
          </p>
        </div>
        <div className='text-right'>
          <Badge
            variant='outline'
            className={`text-xs font-mono h-6 px-2 rounded-lg ${getProbabilityColor(
              scenario.confidence,
            )}`}
          >
            {scenario.confidence}%
          </Badge>
        </div>
      </div>

      {isExpanded && (
        <div className='px-4 py-3 bg-linear-to-r from-muted/20 to-transparent border-b border-border/20 space-y-2'>
          <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
            Key Drivers
          </p>
          <div className='space-y-1.5'>
            {scenario.drivers.map((driver, i) => (
              <div
                key={i}
                className='flex items-center gap-2 text-xs text-muted-foreground'
              >
                <ChevronRight className='h-3 w-3 shrink-0 text-muted-foreground/30' />
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RangeCell({
  low,
  high,
  classNameFor,
}: {
  low: number
  high: number
  classNameFor: (value: number) => string
}) {
  return (
    <div className='text-right'>
      <p className='text-sm font-mono font-semibold'>
        <span className={classNameFor(low)}>{formatCurrency(low)}</span>
        <span className='text-muted-foreground/50 mx-1'>→</span>
        <span className={classNameFor(high)}>{formatCurrency(high)}</span>
      </p>
    </div>
  )
}

const loadingRows = [
  {
    label: 'Bear Market',
    desc: 'Risk-off environment',
    color: 'red',
    icon: TrendingDown,
  },
  {
    label: 'Base Case',
    desc: 'Normal continuation',
    color: 'blue',
    icon: Target,
  },
  {
    label: 'Bull Cycle',
    desc: 'Euphoric expansion',
    color: 'emerald',
    icon: TrendingUp,
  },
] as const

function ScenarioLoadingRow({ scenario }: { scenario: (typeof loadingRows)[number] }) {
  const Icon = scenario.icon
  const iconColor =
    scenario.color === 'red'
      ? 'text-red-500'
      : scenario.color === 'emerald'
        ? 'text-emerald-500'
        : 'text-blue-500'
  const borderColor =
    scenario.color === 'red'
      ? 'border-l-2 border-l-red-500/40'
      : scenario.color === 'emerald'
        ? 'border-l-2 border-l-emerald-500/40'
        : 'border-l-2 border-l-blue-500/40'

  return (
    <div
      className={`grid grid-cols-[160px_1fr_1fr_1fr_90px] gap-3 px-4 py-3 border-b border-border/20 items-center ${borderColor}`}
    >
      <div className='flex items-center gap-2'>
        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
        <div className='flex flex-col min-w-0'>
          <span className='text-sm font-bold truncate'>{scenario.label}</span>
          <span className='text-[11px] text-muted-foreground'>
            {scenario.desc}
          </span>
        </div>
      </div>
      <Skeleton className='h-4 w-20 ml-auto' />
      <Skeleton className='h-4 w-20 ml-auto' />
      <Skeleton className='h-4 w-20 ml-auto' />
      <Skeleton className='h-5 w-14 ml-auto' />
    </div>
  )
}
