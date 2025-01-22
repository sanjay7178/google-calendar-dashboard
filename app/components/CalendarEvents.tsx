"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ChevronDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { signOut } from "@/utils/supabase/signout";
import { useRouter } from "next/navigation";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
  }, [startDate, endDate, filterType]);

  useEffect(() => {
    filterEvents();
  }, [events, startDate, endDate, filterType]);

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

      let apiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&fields=items(id,summary,location,start,end)`;

      if (filterType === "single" && startDate) {
        const endOfDay = new Date(startDate);
        endOfDay.setHours(23, 59, 59, 999);
        apiUrl += `&timeMin=${startDate.toISOString()}&timeMax=${endOfDay.toISOString()}`;
      } else if (filterType === "between" && startDate) {
        apiUrl += `&timeMin=${startDate.toISOString()}`;
        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          apiUrl += `&timeMax=${endOfDay.toISOString()}`;
        }
      } else {
        apiUrl += `&timeMin=${new Date().toISOString()}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      });

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

  const CustomDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between w-40 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
      >
        <span>
          {filterType === "all"
            ? "All Events"
            : filterType === "single"
            ? "Single Date"
            : "Date Range"}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {isDropdownOpen && (
        <div className="absolute z-10 w-40 mt-1 bg-white border rounded-md shadow-lg">
          <div className="py-1">
            {["all", "single", "between"].map((type) => (
              <button
                key={type}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  setFilterType(type as FilterType);
                  setIsDropdownOpen(false);
                }}
              >
                {type === "all"
                  ? "All Events"
                  : type === "single"
                  ? "Single Date"
                  : "Date Range"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const CustomCalendar = ({
    date,
    setDate,
    isOpen,
    setIsOpen,
    disabled = false,
  }: {
    date: Date | null;
    setDate: (date: Date) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    disabled?: boolean;
  }) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDate = new Date();
    const [displayMonth, setDisplayMonth] = useState(date || currentDate);

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      return { daysInMonth, firstDayOfMonth };
    };

    return (
      <div className="relative" ref={calendarRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center w-[240px] px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1 p-4 bg-white border rounded-lg shadow-lg">
            <div className="flex justify-between mb-4">
              <button
                onClick={() =>
                  setDisplayMonth(
                    new Date(displayMonth.setMonth(displayMonth.getMonth() - 1))
                  )
                }
                className="p-1 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <span className="font-semibold">
                {format(displayMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={() =>
                  setDisplayMonth(
                    new Date(displayMonth.setMonth(displayMonth.getMonth() + 1))
                  )
                }
                className="p-1 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
              {Array.from({
                length: getDaysInMonth(displayMonth).firstDayOfMonth,
              }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({
                length: getDaysInMonth(displayMonth).daysInMonth,
              }).map((_, i) => {
                const dayDate = new Date(
                  displayMonth.getFullYear(),
                  displayMonth.getMonth(),
                  i + 1
                );
                const isSelected =
                  date && dayDate.toDateString() === date.toDateString();
                const isDisabled = disabled && dayDate < currentDate;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isDisabled) {
                        setDate(dayDate);
                        setIsOpen(false);
                      }
                    }}
                    disabled={isDisabled}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isSelected && "bg-blue-600 text-white",
                      !isSelected && "hover:bg-gray-100",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
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
            <CustomDropdown />

            <CustomCalendar
              date={startDate}
              setDate={setStartDate}
              isOpen={isCalendarOpen}
              setIsOpen={setIsCalendarOpen}
            />

            {filterType === "between" && (
              <CustomCalendar
                date={endDate}
                setDate={setEndDate}
                isOpen={isEndCalendarOpen}
                setIsOpen={setIsEndCalendarOpen}
                disabled={true}
              />
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Alert>
              <AlertDescription>
                No events found for the selected date range
              </AlertDescription>
            </Alert>
          ) : (
            <div className="relative rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Event
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Location
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Start
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      End
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">
                        {event.summary}
                      </td>
                      <td className="p-4 align-middle">
                        {formatLocation(event.location)}
                      </td>
                      <td className="p-4 align-middle">
                        {formatDateTime(
                          event.start.dateTime || event.start.date
                        )}
                      </td>
                      <td className="p-4 align-middle">
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
