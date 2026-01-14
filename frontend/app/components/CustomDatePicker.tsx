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
    // Adjust for timezone offset
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset*60*1000));
    
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
    <div className="relative group" ref={containerRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">
        {label}
      </label>
      
      {/* Input Box - Looks identical to other fields */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full border border-gray-300 p-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:border-blue-400 transition bg-white"
      >
        <span className={`text-sm ${value ? "text-gray-700 font-medium" : "text-gray-400"}`}>
          {value ? value.split("-").reverse().join("-") : "Select Date"} 
        </span>
        <CalendarIcon size={16} className="text-gray-400" />
      </div>

      {/* Popup Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-72 animate-in fade-in zoom-in-95 duration-200 left-0">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} type="button" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200">
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-gray-800 text-sm">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} type="button" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {dayNames.map(d => (
              <div key={d} className="text-xs font-medium text-gray-400">{d}</div>
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
                  className={`
                    h-8 w-8 rounded-full text-sm flex items-center justify-center transition
                    ${isSelected ? "bg-purple-600 text-white font-bold shadow-md scale-105" : "text-gray-700 hover:bg-gray-100"}
                    ${!isSelected && isToday ? "text-purple-600 font-bold bg-purple-50" : ""}
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between gap-3 pt-3 border-t border-gray-100">
            <button 
              type="button"
              onClick={handleToday}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 w-full uppercase"
            >
              Today
            </button>
            <button 
              type="button"
              onClick={handleSetDate}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md w-full uppercase"
            >
              Set Date
            </button>
          </div>
        </div>
      )}
    </div>
  );
}