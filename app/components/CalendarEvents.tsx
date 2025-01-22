"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DatePicker from "react-datepicker";
import toast, { Toaster } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import { signOut } from "@/utils/supabase/signout";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  summary: string;
  location: string;
  start: {
    dateTime: string;
    date?: string;
  };
  end: {
    dateTime: string;
    date?: string;
  };
}

type FilterType = "all" | "single" | "between";

export default function CalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, [startDate]);

  useEffect(() => {
    filterEvents();
  }, [events, startDate, endDate, filterType]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("No active session found. Please sign in.");
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${startDate?.toISOString() || new Date().toISOString()}&fields=items(id,summary,location,start,end)`,
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch calendar events");
      }

      const data = await response.json();
      setEvents(data.items);
      toast.success("Calendar events loaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch events"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (filterType === "single" && startDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(
          event.start.dateTime || event.start.date || new Date()
        );
        return eventDate.toDateString() === startDate.toDateString();
      });
    } else if (filterType === "between") {
      if (startDate) {
        filtered = filtered.filter((event) => {
          const eventDate = new Date(
            event.start.dateTime || event.start.date || new Date()
          );
          return eventDate >= startDate;
        });
      }

      if (endDate) {
        filtered = filtered.filter((event) => {
          const eventDate = new Date(
            event.start.dateTime || event.start.date || new Date()
          );
          return eventDate <= endDate;
        });
      }
    }

    setFilteredEvents(filtered);
  };

  const formatLocation = (location: string | undefined) => {
    if (!location) return "Virtual Meeting";
    if (location.length > 50) return `${location.substring(0, 50)}...`;
    return location;
  };

  const formatDateTime = (dateTime: string | undefined) => {
    if (!dateTime) return "N/A";
    return new Date(dateTime).toLocaleString();
  };

  return (
    <>
      <Toaster position="top-right" />
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Calendar Events</CardTitle>
          <button
            onClick={() => signOut(router)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign out"}
          </button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex space-x-4 items-center">
            <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="single">Single Date</SelectItem>
                <SelectItem value="between">Date Range</SelectItem>
              </SelectContent>
            </Select>

            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart={filterType === "between"}
              startDate={startDate}
              endDate={endDate}
              placeholderText="Select Date"
              className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            
            {filterType === "between" && (
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                placeholderText="End Date"
                className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Alert>
              <AlertDescription>
                No events found for the selected date range
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.summary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLocation(event.location)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(
                          event.start.dateTime || event.start.date
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(event.end.dateTime || event.end.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}