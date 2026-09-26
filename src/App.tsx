import { MagnifyingGlassIcon, NavigationArrowIcon, StarIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getCurrent, searchCities, type Current, type Place } from './weather'

// ponytail: Open-Meteo has no reverse geocoding, so a geolocated place gets this
// fixed name. Use a reverse-geocoding service if the city name matters.
const HERE = 'My location'

type Notice = { text: string; retry?: () => void }

function load(key: string): Place[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function save(key: string, places: Place[]) {
  try {
    localStorage.setItem(key, JSON.stringify(places))
  } catch {
    // Storage blocked (private mode, quota): the app still works, it just forgets.
  }
}

const samePlace = (a: Place, b: Place) =>
  a.latitude.toFixed(2) === b.latitude.toFixed(2) && a.longitude.toFixed(2) === b.longitude.toFixed(2)

// Open-Meteo returns the place's local wall-clock time without an offset, so parsing it
// as browser-local time and formatting it back keeps the place's clock reading.
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

const control =
  'border border-line bg-surface transition duration-150 hover:bg-surface-hover active:scale-[0.98] motion-reduce:active:scale-100'

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [place, setPlace] = useState<Place | null>(null)
  const [weather, setWeather] = useState<Current | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [saved, setSaved] = useState(() => load('saved'))
  const [recent, setRecent] = useState(() => load('recent'))
  const [loading, setLoading] = useState(() => recent.length > 0 || saved.length > 0)
  // Each request takes a number; a response that is no longer the latest is dropped.
  const latest = useRef(0)

  // Returning visitors land on their last place instead of an empty sky.
  useEffect(() => {
    const last = recent[0] ?? saved[0]
    if (last) show(last)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  useEffect(() => {
    document.title = place && weather ? `${Math.round(weather.temperature)}° ${place.name} | Weather` : 'Weather'
  }, [place, weather])

  function start() {
    setLoading(true)
    setNotice(null)
    return ++latest.current
  }

  async function show(next: Place) {
    const id = start()
    setResults([])
    try {
      const current = await getCurrent(next)
      if (id !== latest.current) return
      setPlace(next)
      setWeather(current)
      if (next.name !== HERE) {
        const list = [next, ...recent.filter((p) => !samePlace(p, next))].slice(0, 5)
        setRecent(list)
        save('recent', list)
      }
    } catch (error) {
      if (id === latest.current) setNotice({ text: (error as Error).message, retry: () => show(next) })
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
    } catch (error) {
      if (id === latest.current) setNotice({ text: (error as Error).message, retry: () => find(name) })
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
    save('saved', list)
  }

  const sky = weather ? `${weather.kind}-${weather.isDay ? 'day' : 'night'}` : 'idle'
  const unsavedRecent = recent.filter((p) => !saved.some((s) => samePlace(s, p)))

  return (
    <div className="sky min-h-dvh" data-sky={sky}>
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 pt-6 pb-6 sm:px-8 sm:pt-8">
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
                  id="city"
                  name="city"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Jakarta, Tokyo, Reykjavík…"
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  className="h-12 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-base placeholder:text-ink-soft"
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
            </div>
          </form>

          {results.length > 0 && (
            <ul aria-label="Search results" className="overflow-hidden rounded-3xl border border-line bg-surface">
              {results.map((r) => (
                <li key={`${r.latitude},${r.longitude}`}>
                  <button
                    type="button"
                    onClick={() => show(r)}
                    className="flex w-full flex-col items-start px-5 py-3 text-left transition-colors duration-150 hover:bg-surface-hover"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="text-sm text-ink-soft">{r.detail}</span>
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
                  <button type="button" onClick={notice.retry} className="font-medium underline underline-offset-4">
                    Try Again
                  </button>
                )}
              </p>
            )}
          </div>
        </header>

        <section
          aria-label="Current weather"
          aria-busy={loading}
          className={`flex flex-1 flex-col justify-center gap-8 transition-opacity duration-300 ${loading && weather ? 'opacity-60' : ''}`}
        >
          {place && weather ? (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="min-w-0 text-2xl font-medium tracking-tight text-balance break-words sm:text-3xl">{place.name}</h1>
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
                  {Math.round(weather.temperature)}°
                </p>
                <p className="mt-3 text-2xl sm:text-3xl">{weather.label}</p>
                <p className="mt-1 text-sm text-ink-soft">Updated {timeFormat.format(new Date(weather.time))} local time</p>
              </div>

              <dl className="grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-5">
                <Reading label="Feels like" value={Math.round(weather.feelsLike)} unit="°" />
                <Reading label="Humidity" value={weather.humidity} unit="%" />
                <Reading label="Wind" value={Math.round(weather.wind)} unit=" km/h" />
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

        <footer className="text-xs text-ink-soft">
          Weather data by{' '}
          <a href="https://open-meteo.com/" translate="no" className="underline underline-offset-2 hover:text-ink">
            Open-Meteo
          </a>
        </footer>
      </main>
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
          <li key={`${p.latitude},${p.longitude}`}>
            <button
              type="button"
              onClick={() => onPick(p)}
              aria-current={current !== null && samePlace(p, current)}
              className={`${control} h-11 rounded-full px-4 text-sm font-medium aria-[current=true]:border-ink aria-[current=true]:bg-ink aria-[current=true]:text-[var(--sky-mid)]`}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
