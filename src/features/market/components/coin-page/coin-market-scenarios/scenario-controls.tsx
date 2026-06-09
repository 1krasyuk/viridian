import { Clock3, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Slider } from '@/shared/ui/slider'
import { HORIZON_PRESETS, INVESTMENT_PRESETS } from './constants'

export function ScenarioControls({
  investment,
  onInvestmentChange,
  months,
  onMonthsChange,
  isLoading,
}: {
  investment: string
  onInvestmentChange: (value: string) => void
  months: number
  onMonthsChange: (value: number) => void
  isLoading: boolean
}) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5'>
      <div className='space-y-2.5'>
        <div className='flex items-center gap-2'>
          <Wallet className='h-3.5 w-3.5 text-muted-foreground' />
          <label className='text-sm font-medium text-muted-foreground'>
            Investment
          </label>
        </div>
        {isLoading ? (
          <Skeleton className='h-10 w-full rounded-xl' />
        ) : (
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono'>
              $
            </span>
            <Input
              type='number'
              value={investment}
              onChange={(e) => onInvestmentChange(e.target.value)}
              className='h-10 pl-7 font-mono text-sm rounded-xl bg-muted/30 border-muted-foreground/10 focus:bg-background transition-colors'
            />
          </div>
        )}
        <div className='flex flex-wrap gap-1.5'>
          {INVESTMENT_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={investment === String(preset) ? 'default' : 'outline'}
              size='sm'
              className={`h-7 text-xs px-2.5 font-mono rounded-lg transition-all ${
                investment === String(preset)
                  ? 'shadow-sm'
                  : 'bg-muted/20 border-muted-foreground/10 hover:bg-muted/40'
              }`}
              onClick={() => onInvestmentChange(String(preset))}
              disabled={isLoading}
            >
              ${preset >= 1000 ? `${preset / 1000}k` : preset}
            </Button>
          ))}
        </div>
      </div>

      <div className='space-y-2.5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Clock3 className='h-3.5 w-3.5 text-muted-foreground' />
            <label className='text-sm font-medium text-muted-foreground'>
              Horizon
            </label>
          </div>
          <span className='font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg'>
            {isLoading ? (
              <Skeleton className='h-4 w-12 inline-block' />
            ) : (
              `${months}mo`
            )}
          </span>
        </div>
        {isLoading ? (
          <Skeleton className='h-10 w-full rounded-xl' />
        ) : (
          <Slider
            className='h-10 py-2'
            value={[months]}
            onValueChange={(v) => onMonthsChange(v[0])}
            min={1}
            max={36}
            step={1}
          />
        )}
        <div className='flex flex-wrap gap-1.5'>
          {HORIZON_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant={months === preset.months ? 'default' : 'outline'}
              size='sm'
              className={`h-7 text-xs px-2.5 rounded-lg transition-all ${
                months === preset.months
                  ? 'shadow-sm'
                  : 'bg-muted/20 border-muted-foreground/10 hover:bg-muted/40'
              }`}
              onClick={() => onMonthsChange(preset.months)}
              disabled={isLoading}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
