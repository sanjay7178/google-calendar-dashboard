"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import toast, { Toaster } from "react-hot-toast"

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime: string
    date?: string
  }
  end: {
    dateTime: string
    date?: string
  }
}

export default function CalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/")
      } else {
        fetchEvents()
      }
    }
    checkSession()
  }, [supabase, router])

  useEffect(() => {
    filterEvents()
  }, [events, startDate, endDate])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setEvents(data.items || [])
    } catch (err) {
      console.error("Error fetching events:", err)
      toast.error(`Failed to fetch events: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (startDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start.dateTime ?? event.start.date ?? new Date())
        return eventDate >= startDate
      })
    }

    if (endDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start.dateTime ?? event.start.date ?? new Date())
        return eventDate <= endDate
      })
    }

    setFilteredEvents(filtered)
  }

  if (loading) return <div>Loading events...</div>

  return (
    <div className="w-full max-w-4xl">
      <Toaster position="top-right" />
      <div className="mb-4 flex space-x-4">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          className="p-2 border rounded"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || undefined}
          placeholderText="End Date"
          className="p-2 border rounded"
        />
      </div>
      {filteredEvents.length > 0 ? (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Start
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                End
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">{event.summary}</td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                {new Date(event.start.dateTime ?? event.start.date ?? new Date()).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                {new Date(event.end.dateTime ?? event.end.date ?? new Date()).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No events found</div>
      )}
    </div>
  )
}

