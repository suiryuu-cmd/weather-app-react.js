import {
  CloudFogIcon,
  CloudLightningIcon,
  CloudMoonIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  MoonIcon,
  SunIcon,
  type Icon,
} from '@phosphor-icons/react'
import { clockFormat, temperature, wallClock, type Day, type Hour, type Kind, type Unit } from './weather'

const ICONS: Record<Kind, [day: Icon, night: Icon]> = {
  clear: [SunIcon, MoonIcon],
  cloudy: [CloudSunIcon, CloudMoonIcon],
  fog: [CloudFogIcon, CloudFogIcon],
  rain: [CloudRainIcon, CloudRainIcon],
  snow: [CloudSnowIcon, CloudSnowIcon],
  storm: [CloudLightningIcon, CloudLightningIcon],
}

const hourFormat = clockFormat({ hour: 'numeric' })
const dayFormat = clockFormat({ weekday: 'short' })

function KindIcon({ kind, isDay = true }: { kind: Kind; isDay?: boolean }) {
  const Glyph = ICONS[kind][isDay ? 0 : 1]
  return <Glyph aria-hidden size={24} className="shrink-0" />
}

export function Hourly({ hours, unit }: { hours: Hour[]; unit: Unit }) {
  return (
    <section aria-labelledby="hourly" className="flex flex-col gap-3">
      <h2 id="hourly" className="text-sm font-medium text-ink-soft">
        Next 24 Hours
      </h2>
      {/* Focusable so keyboard users can scroll it with the arrow keys. `relative` keeps the
          absolutely positioned sr-only labels inside the scroller instead of widening the page. */}
      <ol
        tabIndex={0}
        aria-labelledby="hourly"
        className="relative -mx-4 flex snap-x gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0"
      >
        {hours.map((hour, i) => (
          <li
            key={hour.time}
            className="flex w-16 shrink-0 snap-start flex-col items-center gap-2 rounded-3xl py-3 first:bg-surface"
          >
            <span className="text-sm text-ink-soft">{i === 0 ? 'Now' : hourFormat.format(wallClock(hour.time))}</span>
            <KindIcon kind={hour.kind} isDay={hour.isDay} />
            <span className="sr-only">{hour.label}</span>
            <span className="text-lg tabular-nums">{temperature(hour.temperature, unit)}°</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Daily({ days, unit }: { days: Day[]; unit: Unit }) {
  return (
    <section aria-labelledby="daily" className="flex flex-col gap-3">
      <h2 id="daily" className="text-sm font-medium text-ink-soft">
        Next 7 Days
      </h2>
      <ol className="flex flex-col">
        {days.map((day, i) => (
          <li key={day.date} className="grid grid-cols-[4rem_1.5rem_1fr_auto] items-center gap-3 py-2.5">
            <span className="font-medium">{i === 0 ? 'Today' : dayFormat.format(wallClock(day.date))}</span>
            <KindIcon kind={day.kind} />
            <span className="min-w-0 break-words text-ink-soft">{day.label}</span>
            <span className="text-right tabular-nums">
              {temperature(day.max, unit)}°{' '}
              <span className="ml-2 text-ink-soft">{temperature(day.min, unit)}°</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
