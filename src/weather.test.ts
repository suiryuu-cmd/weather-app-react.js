import { afterEach, describe, expect, it, vi } from 'vitest'
import { getWeather, isWeather, searchCities, temperature, windSpeed, type Place } from './weather'

const place: Place = { name: 'Testville', detail: 'Nowhere', latitude: 1, longitude: 2 }

// A trimmed Open-Meteo forecast response: 48 hourly steps from midnight, 7 days.
function forecast({ time = '2026-09-26T05:45', sunrise = '2026-09-26T05:40', sunset = '2026-09-26T17:50' } = {}) {
  const hours = Array.from({ length: 48 }, (_, i) => `2026-09-${26 + Math.floor(i / 24)}T${String(i % 24).padStart(2, '0')}:00`)
  return {
    current: { time, temperature_2m: 21.4, apparent_temperature: 20, relative_humidity_2m: 80, wind_speed_10m: 10, weather_code: 0, is_day: 1 },
    hourly: { time: hours, temperature_2m: hours.map((_, i) => i), weather_code: hours.map(() => 61), is_day: hours.map(() => 0) },
    daily: {
      time: ['26', '27', '28', '29', '30'].map((d) => `2026-09-${d}`).concat(['2026-10-01', '2026-10-02']),
      weather_code: [0, 3, 45, 61, 71, 95, 999],
      temperature_2m_max: [30, 29, 28, 27, 26, 25, 24],
      temperature_2m_min: [20, 19, 18, 17, 16, 15, 14],
      sunrise: [sunrise],
      sunset: [sunset],
    },
  }
}

function respond(body: unknown, ok = true, status = 200) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok, status, json: async () => body })))
}

afterEach(() => vi.unstubAllGlobals())

describe('getWeather', () => {
  it('parses current weather, 24 hours from the current hour, and 7 days', async () => {
    respond(forecast())
    const w = await getWeather(place)
    expect(w.current).toMatchObject({ temperature: 21.4, label: 'Clear sky', kind: 'clear', isDay: true, time: '2026-09-26T05:45' })
    expect(w.hours).toHaveLength(24)
    expect(w.hours[1].time).toBe('2026-09-26T06:00')
    expect(w.hours[23].time).toBe('2026-09-27T04:00')
    expect(w.days.map((d) => d.kind)).toEqual(['clear', 'cloudy', 'fog', 'rain', 'snow', 'storm', 'cloudy'])
    expect(w.days[6].label).toBe('Unknown')
    expect(isWeather(w)).toBe(true)
  })

  it('makes the "Now" tile match the current reading, not the hourly model', async () => {
    respond(forecast())
    const [now] = (await getWeather(place)).hours
    expect(now).toMatchObject({ time: '2026-09-26T05:00', temperature: 21.4, kind: 'clear', label: 'Clear sky', isDay: true })
  })

  it('marks dawn and dusk within 40 minutes of sunrise and sunset only', async () => {
    const twilight = async (time: string, sun?: { sunrise: string; sunset: string }) => {
      respond(forecast({ time, ...sun }))
      return (await getWeather(place)).current.twilight
    }
    expect(await twilight('2026-09-26T06:15')).toBe('dawn')
    expect(await twilight('2026-09-26T18:30')).toBe('dusk')
    expect(await twilight('2026-09-26T12:00')).toBeNull()
    // Polar night and polar day: Open-Meteo returns midnight placeholders.
    const polarNight = { sunrise: '2026-09-26T00:00', sunset: '2026-09-26T00:00' }
    const polarDay = { sunrise: '2026-09-26T00:00', sunset: '2026-09-27T00:00' }
    expect(await twilight('2026-09-26T00:15', polarNight)).toBeNull()
    expect(await twilight('2026-09-26T00:15', polarDay)).toBeNull()
  })

  it('turns HTTP and network failures into readable messages', async () => {
    respond({}, false, 503)
    await expect(getWeather(place)).rejects.toThrow('Weather service returned 503. Try again in a moment.')
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))))
    await expect(getWeather(place)).rejects.toThrow("Couldn't reach the weather service.")
  })
})

describe('searchCities', () => {
  it('maps results and handles no matches', async () => {
    respond({ results: [{ name: 'Bandung', admin1: 'West Java', country: 'Indonesia', latitude: -6.9, longitude: 107.6 }] })
    expect(await searchCities('Bandung')).toEqual([{ name: 'Bandung', detail: 'West Java, Indonesia', latitude: -6.9, longitude: 107.6 }])
    respond({})
    expect(await searchCities('zzqx')).toEqual([])
  })
})

describe('isWeather', () => {
  it('rejects cached data the UI could not render', async () => {
    respond(forecast())
    const good = await getWeather(place)
    expect(isWeather({ current: {}, hours: [], days: [] })).toBe(false)
    expect(isWeather({ ...good, current: { ...good.current, time: 'not a time' } })).toBe(false)
    expect(isWeather({ ...good, hours: [{ ...good.hours[0], kind: 'sunny' }] })).toBe(false)
    expect(isWeather({ ...good, days: [{ ...good.days[0], max: null }] })).toBe(false)
    expect(isWeather(null)).toBe(false)
  })
})

describe('units', () => {
  it('converts temperature and wind', () => {
    expect(temperature(21.4, 'C')).toBe(21)
    expect(temperature(0, 'F')).toBe(32)
    expect(temperature(-40, 'F')).toBe(-40)
    expect(windSpeed(100, 'C')).toBe(100)
    expect(windSpeed(100, 'F')).toBe(62)
  })
})
