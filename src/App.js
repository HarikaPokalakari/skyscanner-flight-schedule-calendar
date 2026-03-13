import { useMemo, useState } from 'react';
import './App.css';
import BpkCalendar, {
  CALENDAR_SELECTION_TYPE,
} from '@skyscanner/backpack-web/bpk-component-calendar';
import { BpkButtonV2 } from '@skyscanner/backpack-web/bpk-component-button';
import format from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';

const formatDateFull = (date) => format(date, 'EEEE, do MMMM yyyy');
const formatMonth = (date) => format(date, 'MMMM yyyy');

const daysOfWeek = [
  { name: 'Sunday', nameAbbr: 'Sun', index: 0, isWeekend: true },
  { name: 'Monday', nameAbbr: 'Mon', index: 1, isWeekend: false },
  { name: 'Tuesday', nameAbbr: 'Tue', index: 2, isWeekend: false },
  { name: 'Wednesday', nameAbbr: 'Wed', index: 3, isWeekend: false },
  { name: 'Thursday', nameAbbr: 'Thu', index: 4, isWeekend: false },
  { name: 'Friday', nameAbbr: 'Fri', index: 5, isWeekend: false },
  { name: 'Saturday', nameAbbr: 'Sat', index: 6, isWeekend: true },
];

function App() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [tripType, setTripType] = useState('round-trip');
  const [fromCity, setFromCity] = useState('London');
  const [toCity, setToCity] = useState('New York');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
  });

  const selectionConfiguration = useMemo(() => {
    if (tripType === 'one-way') {
      return {
        type: CALENDAR_SELECTION_TYPE.single,
        date: selectedDates.startDate,
      };
    }

    return {
      type: CALENDAR_SELECTION_TYPE.range,
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
    };
  }, [tripType, selectedDates]);

  const handleDateSelect = (date) => {
    if (isBefore(startOfDay(date), today)) {
      return;
    }

    setShowConfirmation(false);

    if (tripType === 'one-way') {
      setSelectedDates({
        startDate: date,
        endDate: null,
      });
      return;
    }

    const { startDate, endDate } = selectedDates;

    if (!startDate || (startDate && endDate)) {
      setSelectedDates({
        startDate: date,
        endDate: null,
      });
      return;
    }

    if (isBefore(date, startDate)) {
      setSelectedDates({
        startDate: date,
        endDate: startDate,
      });
      return;
    }

    setSelectedDates({
      startDate,
      endDate: date,
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;

    setIsSearching(true);
    setShowConfirmation(false);

    setTimeout(() => {
      setIsSearching(false);
      setShowConfirmation(true);
    }, 1200);
  };

  const handleSwapAirports = () => {
    setFromCity(toCity);
    setToCity(fromCity);
    setShowConfirmation(false);
  };

  const canContinue =
    tripType === 'one-way'
      ? Boolean(selectedDates.startDate)
      : Boolean(selectedDates.startDate && selectedDates.endDate);

  const tripSummary =
    tripType === 'one-way'
      ? selectedDates.startDate
        ? `${format(selectedDates.startDate, 'dd MMM yyyy')}`
        : 'Select a departure date'
      : selectedDates.startDate && selectedDates.endDate
      ? `${format(selectedDates.startDate, 'dd MMM yyyy')} → ${format(
          selectedDates.endDate,
          'dd MMM yyyy',
        )}`
      : 'Select departure and return dates';

  return (
    <div className={`App ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <header className="App-header">
        <div className="top-bar">
          <h1>Flight Schedule</h1>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsDarkMode((prev) => !prev)}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <p className="subtitle">Choose your journey details and travel dates</p>

        <div className="search-card">
          <div className="trip-type-row">
            <button
              type="button"
              className={`trip-type-button ${
                tripType === 'round-trip' ? 'active' : ''
              }`}
              onClick={() => {
                setTripType('round-trip');
                setShowConfirmation(false);
              }}
            >
              Round Trip
            </button>
            <button
              type="button"
              className={`trip-type-button ${
                tripType === 'one-way' ? 'active' : ''
              }`}
              onClick={() => {
                setTripType('one-way');
                setSelectedDates((prev) => ({
                  startDate: prev.startDate,
                  endDate: null,
                }));
                setShowConfirmation(false);
              }}
            >
              One Way
            </button>
          </div>

          <div className="route-grid">
            <div className="input-group">
              <label htmlFor="fromCity">From</label>
              <input
                id="fromCity"
                type="text"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="City or airport"
              />
            </div>

            <div className="swap-wrapper">
              <button
                type="button"
                className="swap-button"
                onClick={handleSwapAirports}
                aria-label="Swap origin and destination"
              >
                ⇄
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="toCity">To</label>
              <input
                id="toCity"
                type="text"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="City or airport"
              />
            </div>
          </div>

          <p className="calendar-hint">
            {tripType === 'one-way'
              ? 'Select your departure date'
              : 'Select your departure and return dates'}
          </p>

          <div className="calendar-wrapper">
            <BpkCalendar
              id="calendar"
              onDateSelect={handleDateSelect}
              formatMonth={formatMonth}
              formatDateFull={formatDateFull}
              daysOfWeek={daysOfWeek}
              weekStartsOn={1}
              changeMonthLabel="Change month"
              nextMonthLabel="Next month"
              previousMonthLabel="Previous month"
              selectionConfiguration={selectionConfiguration}
              minDate={today}
            />
          </div>

          <div className="date-card">
            <strong>Trip Summary</strong>
            <p>{tripSummary}</p>
            <span>
              {fromCity || 'Origin'} → {toCity || 'Destination'}
            </span>
          </div>

          <div className="button-wrapper">
            <BpkButtonV2 onClick={handleContinue} disabled={!canContinue || isSearching}>
              {isSearching ? 'Searching...' : 'Continue'}
            </BpkButtonV2>
          </div>

          {showConfirmation && (
            <div className="confirmation-card">
              <h2>Flight Search Ready</h2>
              <p>
                Route: <strong>{fromCity || 'Origin'}</strong> →{' '}
                <strong>{toCity || 'Destination'}</strong>
              </p>
              <p>
                Dates: <strong>{tripSummary}</strong>
              </p>
              <p>Trip Type: {tripType === 'one-way' ? 'One Way' : 'Round Trip'}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;