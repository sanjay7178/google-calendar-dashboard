"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, startDate, endDate])

  const fetchEvents = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      },
    )

    const data = await response.json()
    setEvents(data.items)
  }

  const filterEvents = () => {
    let filtered = events

    if (startDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start.dateTime || event.start.date)
        return eventDate >= startDate
      })
    }

    if (endDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start.dateTime || event.start.date)
        return eventDate <= endDate
      })
    }

    setFilteredEvents(filtered)
  }

  return (
    <div className="w-full max-w-4xl">
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
          minDate={startDate}
          placeholderText="End Date"
          className="p-2 border rounded"
        />
      </div>
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
                {new Date(event.start.dateTime || event.start.date).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                {new Date(event.end.dateTime || event.end.date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

