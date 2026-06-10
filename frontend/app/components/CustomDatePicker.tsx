"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function CustomDatePicker({ label, value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync internal state if external value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setSelectedDate(d);
      setViewDate(d);
    }
  }, [value]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleSetDate = () => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewDate(today);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  // Generate days grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month) === 0 ? 6 : firstDayOfMonth(year, month) - 1; // Mon=0
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="relative" ref={containerRef}>
      <label className="neu-label">{label}</label>
      
      {/* Input Box — flat neumorphic input style */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="neu-input flex items-center justify-between cursor-pointer"
      >
        <span
          className="text-sm"
          style={{ color: value ? "var(--cb-text-body)" : "var(--cb-text-placeholder)", fontWeight: value ? 500 : 400 }}
        >
          {value ? value.split("-").reverse().join("-") : "Select Date"} 
        </span>
        <CalendarIcon size={16} style={{ color: "var(--cb-text-label)" }} />
      </div>

      {/* Popup Calendar */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 p-4 w-72 neu-fade-in left-0 neu-card"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="neu-btn p-2"
              style={{ padding: "0.4rem" }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="font-bold text-sm"
              style={{ color: "var(--cb-text-heading)" }}
            >
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              type="button"
              className="neu-btn p-2"
              style={{ padding: "0.4rem" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {dayNames.map(d => (
              <div
                key={d}
                className="text-xs font-semibold"
                style={{
                  color: "var(--cb-text-placeholder)",
                  fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = i + 1;
              const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
              const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;
              
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDayClick(d)}
                  className="h-8 w-8 rounded-full text-sm flex items-center justify-center transition-all duration-150"
                  style={{
                    background: isSelected ? "var(--cb-primary)" : "transparent",
                    color: isSelected ? "#ffffff" : "var(--cb-text-body)",
                    fontWeight: isSelected || isToday ? 700 : 400,
                    boxShadow: isSelected ? "var(--cb-raised-sm)" : "none",
                    ...(isToday && !isSelected ? {
                      background: "rgba(74, 127, 196, 0.1)",
                      color: "var(--cb-primary)",
                    } : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#dde3eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !(isToday)) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    } else if (isToday && !isSelected) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(74, 127, 196, 0.1)";
                    }
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="flex justify-between gap-3 pt-3"
            style={{ borderTop: "1px solid var(--cb-divider)" }}
          >
            <button 
              type="button"
              onClick={handleToday}
              className="neu-btn w-full text-xs uppercase tracking-wide"
              style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}
            >
              Today
            </button>
            <button 
              type="button"
              onClick={handleSetDate}
              className="neu-btn neu-btn-primary w-full text-xs uppercase tracking-wide"
              style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}
            >
              Set Date
            </button>
          </div>
        </div>
      )}
    </div>
  );
}