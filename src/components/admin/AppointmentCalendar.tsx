"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { STATUS_COLORS } from "@/lib/appointments";

export type CalendarAppointment = {
  id: string;
  name: string;
  phone: string;
  carType: string;
  date: string;
  time: string;
  comments: string;
  isMobile: boolean;
  address: string;
  zipCode: string;
  status: "BOOKED" | "CONFIRMED" | "CANCELED";
  source: "ONLINE" | "CALL_IN";
};

type Props = {
  appointments: CalendarAppointment[];
  month: Date;
  onMonthChange: (date: Date) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AppointmentCalendar({
  appointments,
  month,
  onMonthChange,
}: Props) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPad = monthStart.getDay();
  const paddedDays: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ];

  while (paddedDays.length % 7 !== 0) {
    paddedDays.push(null);
  }

  function getEventsForDay(day: Date) {
    const dateStr = format(day, "yyyy-MM-dd");
    return appointments.filter((a) => a.date === dateStr);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            onMonthChange(
              new Date(month.getFullYear(), month.getMonth() - 1, 1)
            )
          }
        >
          ← Prev
        </button>
        <h3 style={{ margin: 0 }}>{format(month, "MMMM yyyy")}</h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            onMonthChange(
              new Date(month.getFullYear(), month.getMonth() + 1, 1)
            )
          }
        >
          Next →
        </button>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ background: STATUS_COLORS.BOOKED }}
          />
          Booked
        </div>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ background: STATUS_COLORS.CONFIRMED }}
          />
          Confirmed
        </div>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ background: STATUS_COLORS.CANCELED }}
          />
          Canceled
        </div>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-header">
            {d}
          </div>
        ))}

        {paddedDays.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="calendar-day other-month" />;
          }

          const events = getEventsForDay(day);
          const inMonth = isSameMonth(day, month);

          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${!inMonth ? "other-month" : ""}`}
              style={isToday(day) ? { borderColor: "var(--cyan)", borderWidth: 2 } : {}}
            >
              <div className="calendar-day-number">{format(day, "d")}</div>
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="calendar-event"
                  style={{
                    background:
                      STATUS_COLORS[ev.status as keyof typeof STATUS_COLORS],
                  }}
                >
                  {ev.time} — {ev.name}
                  <div className="event-tooltip">
                    <strong>{ev.name}</strong>
                    <br />
                    {ev.time} · {ev.carType}
                    <br />
                    {ev.phone}
                    <br />
                    Status: {ev.status}
                    <br />
                    Service: {ev.isMobile ? "Mobile" : "On-site"}
                    {ev.isMobile && (
                      <>
                        <br />
                        {ev.address}
                        <br />
                        Zip: {ev.zipCode}
                      </>
                    )}
                    <br />
                    Source: {ev.source === "CALL_IN" ? "Call-in" : "Online"}
                    {ev.comments && (
                      <>
                        <br />
                        Notes: {ev.comments}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
