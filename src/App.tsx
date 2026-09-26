import { MagnifyingGlassIcon, NavigationArrowIcon, StarIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Daily, Hourly } from './Forecast'
import {
  clockFormat,
  getWeather,
  isWeather,
  searchCities,
  temperature,
  wallClock,
  windSpeed,
  type Place,
  type Unit,
  type Weather,
} from './weather'

// ponytail: Open-Meteo has no reverse geocoding, so a geolocated place gets this
// fixed name. Use a reverse-geocoding service if the city name matters.
const HERE = 'My location'

type Notice = { text: string; retry?: () => void }

// localStorage is user-editable, so everything read back is checked before use.
function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked (private mode, quota): the app still works, it just forgets.
  }
}

const isPlace = (p: unknown): p is Place =>
  typeof p === 'object' &&
  p !== null &&
  typeof (p as Place).name === 'string' &&
  typeof (p as Place).detail === 'string' &&
  Number.isFinite((p as Place).latitude) &&
  Number.isFinite((p as Place).longitude)

function loadPlaces(key: string): Place[] {
  const value = read(key)
  return Array.isArray(value) ? value.filter(isPlace) : []
}

// The last weather shown, so a returning visitor sees a sky at once while it refreshes.
function loadLast(): { place: Place; weather: Weather } | null {
  const value = read('last') as { place?: unknown; weather?: unknown } | null
  return value && isPlace(value.place) && isWeather(value.weather) ? { place: value.place, weather: value.weather } : null
}

const samePlace = (a: Place, b: Place) => a.latitude === b.latitude && a.longitude === b.longitude

const timeFormat = clockFormat({ hour: 'numeric', minute: '2-digit' })

const ANIMATED = ['rain-', 'storm-', 'snow-', 'fog-']

const control =
  'border border-line bg-surface transition duration-150 hover:bg-surface-hover active:scale-[0.98] motion-reduce:active:scale-100'

export default function App() {
  const [initial] = useState(loadLast)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [place, setPlace] = useState<Place | null>(initial?.place ?? null)
  const [weather, setWeather] = useState<Weather | null>(initial?.weather ?? null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [saved, setSaved] = useState(() => loadPlaces('saved'))
  const [recent, setRecent] = useState(() => loadPlaces('recent'))
  const [unit, setUnit] = useState<Unit>(() => (read('unit') === 'F' ? 'F' : 'C'))
  const [loading, setLoading] = useState(() => !initial && (recent.length > 0 || saved.length > 0))
  const [still, setStill] = useState(() => read('still') === true)
  // Screen-reader-only announcement: results found, or the weather that just loaded.
  const [status, setStatus] = useState('')
  // Each request takes a number; a response that is no longer the latest is dropped.
  const latest = useRef(0)
  const skyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Set when the control that started a request disappears on click (a search result,
  // "Try Again"), so focus can land somewhere sensible instead of falling to <body>.
  const refocus = useRef<'heading' | 'input' | null>(null)

  const now = weather?.current
  // Dawn and dusk only replace clear or cloudy skies; rain at sunset still looks like rain.
  const sky = !now
    ? 'idle'
    : now.twilight && (now.kind === 'clear' || now.kind === 'cloudy')
      ? now.twilight
      : `${now.kind}-${now.isDay ? 'day' : 'night'}`

  // Returning visitors land on their last place: shown from cache, then refreshed quietly.
  useEffect(() => {
    const last = initial?.place ?? recent[0] ?? saved[0]
    if (last) show(last, Boolean(initial))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  useEffect(() => {
    document.title = place && now ? `${temperature(now.temperature, unit)}° ${place.name} | Weather` : 'Weather'
  }, [place, now, unit])

  // Match the browser's toolbar to the sky once its colour transition has settled.
  useEffect(() => {
    const id = setTimeout(() => {
      if (!skyRef.current) return
      const top = getComputedStyle(skyRef.current).getPropertyValue('--sky-top')
      document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', top))
    }, 1300)
    return () => clearTimeout(id)
  }, [sky])

  // Runs after the new weather has rendered, so the heading exists to take focus.
  useEffect(() => {
    if (refocus.current === 'heading') headingRef.current?.focus()
    refocus.current = null
  }, [weather])

  // Where focus goes when a request ends without new weather.
  function recoverFocus() {
    if (refocus.current) inputRef.current?.focus()
    refocus.current = null
  }

  function start(showLoading = true) {
    if (showLoading) setLoading(true)
    setNotice(null)
    return ++latest.current
  }

  async function show(next: Place, quiet = false) {
    const id = start(!quiet)
    setResults([])
    try {
      const data = await getWeather(next)
      if (id !== latest.current) return
      setPlace(next)
      setWeather(data)
      if (refocus.current) refocus.current = 'heading'
      if (!quiet) setStatus(`${next.name}: ${temperature(data.current.temperature, unit)}°, ${data.current.label}`)
      write('last', { place: next, weather: data })
      if (next.name !== HERE) {
        const list = [next, ...recent.filter((p) => !samePlace(p, next))].slice(0, 5)
        setRecent(list)
        write('recent', list)
      }
    } catch (error) {
      if (id === latest.current) {
        setNotice({ text: (error as Error).message, retry: () => show(next) })
        recoverFocus()
      }
    } finally {
      if (id === latest.current) setLoading(false)
    }
  }

  async function find(name: string) {
    const id = start()
    try {
      const found = await searchCities(name)
      if (id !== latest.current) return
      setResults(found)
      if (!found.length) setNotice({ text: `No places found for “${name}”. Check the spelling or try a larger city nearby.` })
      else setStatus(`${found.length} ${found.length === 1 ? 'place' : 'places'} found`)
      recoverFocus()
    } catch (error) {
      if (id === latest.current) {
        setResults([])
        setNotice({ text: (error as Error).message, retry: () => find(name) })
        recoverFocus()
      }
    } finally {
      if (id === latest.current) setLoading(false)
    }
  }

  function onSearch(event: FormEvent) {
    event.preventDefault()
    const name = query.trim()
    if (name) find(name)
  }

  function locate() {
    if (!('geolocation' in navigator)) {
      setNotice({ text: "This browser can't share your location. Search for a city instead." })
      return
    }
    const id = start()
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (id !== latest.current) return
        show({
          name: HERE,
          detail: `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
      },
      (error) => {
        if (id !== latest.current) return
        setLoading(false)
        recoverFocus()
        setNotice(
          error.code === error.PERMISSION_DENIED
            ? { text: 'Location access is blocked. Allow it in your browser settings, or search for a city.' }
            : { text: "Couldn't find your location. Try again or search for a city.", retry: locate },
        )
      },
      { timeout: 10000, maximumAge: 600000 },
    )
  }

  const isSaved = place ? saved.some((p) => samePlace(p, place)) : false

  function toggleSaved() {
    if (!place) return
    const list = isSaved ? saved.filter((p) => !samePlace(p, place)) : [...saved, place]
    setSaved(list)
    write('saved', list)
  }

  function changeUnit(next: Unit) {
    setUnit(next)
    write('unit', next)
  }

  function toggleStill() {
    setStill(!still)
    write('still', !still)
  }

  // Leaving a control that is about to unmount: remember to put focus back afterwards.
  function fromVanishingControl(action: () => void) {
    refocus.current = 'input'
    action()
  }

  const unsavedRecent = recent.filter((p) => !saved.some((s) => samePlace(s, p)))
  const animated = ANIMATED.some((prefix) => sky.startsWith(prefix))

  return (
    <div ref={skyRef} className="sky flex min-h-dvh flex-col" data-sky={sky} data-still={still || undefined}>
      <div aria-hidden className="sky-fx" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pt-6 sm:px-8 sm:pt-8">
        <header className="flex flex-col gap-3">
          <form role="search" onSubmit={onSearch} className="flex flex-col gap-2">
            <label htmlFor="city" className="text-sm font-medium">
              Search for a city
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon
                  aria-hidden
                  size={20}
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-soft"
                />
                <input
                  ref={inputRef}
                  id="city"
                  name="city"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Jakarta, Tokyo, Reykjavík…"
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  className="h-12 w-full rounded-full border border-ink/60 bg-surface pr-4 pl-11 text-base placeholder:text-ink-soft"
                />
              </div>
              <button
                type="button"
                onClick={locate}
                aria-label="Use My Location"
                className={`${control} flex h-12 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium`}
              >
                <NavigationArrowIcon aria-hidden size={20} />
                <span aria-hidden className="hidden sm:inline">
                  Use My Location
                </span>
              </button>
              <div role="group" aria-label="Temperature unit" className="flex h-12 shrink-0 rounded-full border border-line bg-surface p-px">
                {(['C', 'F'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => changeUnit(u)}
                    aria-pressed={unit === u}
                    className="w-11 rounded-full text-sm font-medium transition-colors duration-150 hover:bg-surface-hover aria-pressed:bg-ink aria-pressed:text-[var(--sky-mid)]"
                  >
                    °{u}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {results.length > 0 && (
            <ul aria-label="Search results" className="overflow-hidden rounded-3xl border border-line bg-surface">
              {results.map((r) => (
                <li key={`${r.latitude},${r.longitude}`}>
                  <button
                    type="button"
                    onClick={() => fromVanishingControl(() => show(r))}
                    className="flex w-full flex-col items-start px-5 py-3 text-left break-words transition-colors duration-150 hover:bg-surface-hover"
                  >
                    <span className="max-w-full font-medium">{r.name}</span>
                    <span className="max-w-full text-sm text-ink-soft">{r.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div aria-live="polite" className="text-sm">
            {notice && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {notice.text}
                {notice.retry && (
                  <button
                    type="button"
                    onClick={() => notice.retry && fromVanishingControl(notice.retry)}
                    className="font-medium underline underline-offset-4"
                  >
                    Try Again
                  </button>
                )}
              </p>
            )}
          </div>
          <p role="status" className="sr-only">
            {status}
          </p>
        </header>

        <section
          aria-label="Current weather"
          aria-busy={loading}
          className={`flex flex-1 flex-col justify-center gap-8 transition-opacity duration-300 ${loading && now ? 'opacity-60' : ''}`}
        >
          {place && now ? (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    ref={headingRef}
                    tabIndex={-1}
                    className="min-w-0 text-2xl font-medium tracking-tight text-balance break-words outline-none sm:text-3xl"
                  >
                    {place.name}
                  </h1>
                  {place.name !== HERE && (
                    <button
                      type="button"
                      onClick={toggleSaved}
                      aria-pressed={isSaved}
                      aria-label={`Save ${place.name}`}
                      className="grid size-11 shrink-0 place-items-center rounded-full transition duration-150 hover:bg-surface active:scale-95 motion-reduce:active:scale-100"
                    >
                      <StarIcon aria-hidden size={22} weight={isSaved ? 'fill' : 'regular'} />
                    </button>
                  )}
                </div>
                {place.detail && <p className="text-ink-soft">{place.detail}</p>}
              </div>

              <div>
                <p className="text-[clamp(5.5rem,24vw,9rem)] leading-[0.9] font-extralight tracking-[-0.04em] tabular-nums">
                  {temperature(now.temperature, unit)}°
                </p>
                <p className="mt-3 text-2xl sm:text-3xl">{now.label}</p>
                <p className="mt-1 text-sm text-ink-soft">Updated {timeFormat.format(wallClock(now.time))} local time</p>
              </div>

              <dl className="grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-5">
                <Reading label="Feels like" value={temperature(now.feelsLike, unit)} unit="°" />
                <Reading label="Humidity" value={now.humidity} unit="%" />
                <Reading label="Wind" value={windSpeed(now.wind, unit)} unit={unit === 'F' ? ' mph' : ' km/h'} />
              </dl>
            </>
          ) : loading ? (
            <div className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none">
              <span className="sr-only">Loading weather…</span>
              <div className="h-8 w-48 rounded-full bg-surface" />
              <div className="h-28 w-56 rounded-3xl bg-surface" />
              <div className="h-7 w-36 rounded-full bg-surface" />
            </div>
          ) : (
            <h1 className="text-5xl leading-[1.05] font-extralight tracking-[-0.03em] text-balance sm:text-7xl">
              Check the Sky Anywhere
            </h1>
          )}
        </section>

        {(saved.length > 0 || unsavedRecent.length > 0) && (
          <nav aria-label="Places" className="flex flex-col gap-5">
            <Places title="Saved" places={saved} current={place} onPick={show} />
            <Places title="Recent" places={unsavedRecent} current={place} onPick={show} />
          </nav>
        )}

        {weather && (
          <div className="flex flex-col gap-10 pt-4">
            <Hourly hours={weather.hours} unit={unit} />
            <Daily days={weather.days} unit={unit} />
          </div>
        )}

      </main>

      <footer className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-8 pb-6 text-xs text-ink-soft sm:px-8">
        <p>
          Weather data by{' '}
          <a href="https://open-meteo.com/" translate="no" className="underline underline-offset-2 hover:text-ink">
            Open-Meteo
          </a>
        </p>
        {animated && (
          <button
            type="button"
            onClick={toggleStill}
            aria-pressed={still}
            className="inline-flex min-h-6 items-center underline underline-offset-2 hover:text-ink"
          >
            Pause Animation
          </button>
        )}
      </footer>
    </div>
  )
}

function Reading({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="mt-1 text-2xl tabular-nums">
        {value}
        <span className="text-base text-ink-soft">{unit}</span>
      </dd>
    </div>
  )
}

function Places({
  title,
  places,
  current,
  onPick,
}: {
  title: string
  places: Place[]
  current: Place | null
  onPick: (place: Place) => void
}) {
  if (!places.length) return null
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-ink-soft">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {places.map((p) => (
          <li key={`${p.latitude},${p.longitude}`} className="max-w-full">
            <button
              type="button"
              onClick={() => onPick(p)}
              aria-current={current !== null && samePlace(p, current)}
              title={p.name}
              className={`${control} h-11 max-w-full truncate rounded-full px-4 text-sm font-medium aria-[current=true]:border-ink aria-[current=true]:bg-ink aria-[current=true]:text-[var(--sky-mid)]`}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
