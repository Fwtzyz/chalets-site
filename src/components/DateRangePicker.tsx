import { useState } from "react";

interface DateRangePickerProps {
  checkInDate: string;
  checkOutDate: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  minDate?: string;
  unavailableDates?: string[];
}

export function DateRangePicker({
  checkInDate,
  checkOutDate,
  onCheckInChange,
  onCheckOutChange,
  minDate,
  unavailableDates = []
}: DateRangePickerProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const actualMinDate = minDate || today;
  
  // Get tomorrow's date as minimum checkout date
  const getMinCheckOutDate = () => {
    if (!checkInDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    const checkIn = new Date(checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  };

  const isDateUnavailable = (date: string) => {
    return unavailableDates.includes(date);
  };

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDateForDisplay = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const selectedDate = formatDateForDisplay(displayYear, displayMonth, day);
    
    if (selectedDate < actualMinDate || isDateUnavailable(selectedDate)) {
      return;
    }

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Start new selection
      onCheckInChange(selectedDate);
      onCheckOutChange('');
    } else if (checkInDate && !checkOutDate) {
      // Set checkout date
      if (selectedDate > checkInDate) {
        onCheckOutChange(selectedDate);
      } else {
        // If selected date is before check-in, start new selection
        onCheckInChange(selectedDate);
        onCheckOutChange('');
      }
    }
  };

  const getDayClassName = (day: number) => {
    const dateStr = formatDateForDisplay(displayYear, displayMonth, day);
    const isToday = dateStr === today;
    const isSelected = dateStr === checkInDate || dateStr === checkOutDate;
    const isInRange = checkInDate && checkOutDate && dateStr > checkInDate && dateStr < checkOutDate;
    const isPast = dateStr < actualMinDate;
    const isUnavailable = isDateUnavailable(dateStr);
    
    let className = "w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors ";
    
    if (isPast || isUnavailable) {
      className += "text-gray-300 cursor-not-allowed line-through";
    } else if (isSelected) {
      className += "bg-blue-500 text-white font-bold";
    } else if (isInRange) {
      className += "bg-blue-100 text-blue-800";
    } else if (isToday) {
      className += "bg-gray-200 text-gray-800 font-medium";
    } else {
      className += "text-gray-700 hover:bg-gray-100";
    }
    
    return className;
  };

  const calendarDays = generateCalendarDays(displayYear, displayMonth);

  return (
    <div className="space-y-4">
      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الوصول *
          </label>
          <input
            type="date"
            required
            min={actualMinDate}
            value={checkInDate}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ المغادرة *
          </label>
          <input
            type="date"
            required
            min={getMinCheckOutDate()}
            value={checkOutDate}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            ←
          </button>
          
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[displayMonth]} {displayYear}
          </h3>
          
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((dayName) => (
            <div key={dayName} className="text-center text-xs font-medium text-gray-500 p-2">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="flex justify-center">
              {day ? (
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={getDayClassName(day)}
                >
                  {day}
                </button>
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>محدد</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span>في النطاق</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span>اليوم</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full line-through"></div>
            <span>غير متاح</span>
          </div>
        </div>
      </div>
    </div>
  );
}
