import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, Clock3,
  Compass, Download, Heart, Mail, MapPin, Menu, Moon, QrCode, Search, SlidersHorizontal,
  Sun, Ticket, X,
} from 'lucide-react'
import { categories, events } from './data'
import QRCode from 'qrcode'

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const formatDate = (dateString, options = { day: 'numeric', month: 'short', weekday: 'short' }) =>
  new Intl.DateTimeFormat('en-IN', options).format(new Date(`${dateString}T12:00:00`))

const formatTime = (timeString) => {
  const [hour, minute] = timeString.split(':').map(Number)
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(date)
}

function getRemaining(date, time) {
  const delta = new Date(`${date}T${time}:00`).getTime() - Date.now()
  if (delta <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    expired: false,
    days: Math.floor(delta / 86400000),
    hours: Math.floor((delta % 86400000) / 3600000),
    minutes: Math.floor((delta % 3600000) / 60000),
    seconds: Math.floor((delta % 60000) / 1000),
  }
}

function Countdown({ date, time }) {
  const [remaining, setRemaining] = useState(() => getRemaining(date, time))
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining(date, time)), 1000)
    return () => window.clearInterval(timer)
  }, [date, time])
  if (remaining.expired) return <span className="countdown-expired">Happening now</span>
  return (
    <div className="countdown" aria-label="Countdown to event">
      {[['days', remaining.days], ['hrs', remaining.hours], ['min', remaining.minutes], ['sec', remaining.seconds]].map(([label, value]) => (
        <div className="countdown-unit" key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>
      ))}
    </div>
  )
}

function FooterContactIcon({ kind }) {
  if (kind === 'instagram') {
    return <svg className="footer-brand-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.8" cy="6.5" r="1.15" fill="currentColor" /></svg>
  }
  if (kind === 'facebook') {
    return <svg className="footer-brand-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.7 21v-8.2h2.8l.42-3.2H13.7V7.55c0-.93.26-1.56 1.61-1.56h1.72V3.13C16.73 3.05 15.77 3 14.65 3c-2.67 0-4.5 1.63-4.5 4.62V9.6H7.3v3.2h2.85V21h3.55Z" /></svg>
  }
  return <Mail size={15} />
}

function createTicketPayload(booking, event) {
  return JSON.stringify({
    type: 'MORROW_DIGITAL_TICKET',
    version: 1,
    bookingCode: booking.code,
    attendee: booking.name,
    event: event.title,
    date: event.date,
    time: event.time,
    venue: event.venue,
    issuedAt: booking.createdAt,
  })
}

function DigitalTicket({ booking, event }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrError, setQrError] = useState(false)

  useEffect(() => {
    let active = true
    setQrDataUrl('')
    setQrError(false)
    QRCode.toDataURL(createTicketPayload(booking, event), {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#7C0E44', light: '#FFFDFB' },
    }).then((url) => {
      if (active) setQrDataUrl(url)
    }).catch(() => {
      if (active) setQrError(true)
    })
    return () => { active = false }
  }, [booking, event])

  return (
    <div className="digital-ticket" aria-label={`Digital ticket ${booking.code}`}>
      <div className="digital-ticket-top">
        <div><span>MORROW / DIGITAL PASS</span><b>ADMIT ONE</b></div>
        <span className="digital-ticket-status"><Check size={12} /> CONFIRMED</span>
      </div>
      <div className="digital-ticket-main">
        <div className="digital-ticket-info">
          <span className="digital-ticket-eyebrow">YOUR NEXT GOOD MEMORY</span>
          <h3>{event.title}</h3>
          <div className="digital-ticket-meta">
            <span><CalendarDays size={13} /> {formatDate(event.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span><Clock3 size={13} /> {formatTime(event.time)}</span>
            <span><MapPin size={13} /> {event.venue}</span>
          </div>
        </div>
        <div className="digital-ticket-qr">
          {qrDataUrl ? <img src={qrDataUrl} alt={`QR code for booking ${booking.code}`} /> : <div className="qr-placeholder">{qrError ? 'QR unavailable' : 'Creating QR…'}</div>}
          <span>SCAN AT ENTRY</span>
        </div>
      </div>
      <div className="digital-ticket-bottom">
        <div><span>ATTENDEE</span><b>{booking.name}</b></div>
        <div><span>BOOKING CODE</span><b>{booking.code}</b></div>
      </div>
      {qrDataUrl && <a className="download-ticket-qr" href={qrDataUrl} download={`morrow-${booking.code}-qr.png`}><Download size={13} /> Save QR image</a>}
    </div>
  )
}

function EventCard({ event, onOpen, isSaved, onSave }) {
  return (
    <article className="event-card">
      <button className="event-card-image" onClick={() => onOpen(event)} aria-label={`View ${event.title}`}>
        <img src={event.image} alt={`${event.title} event`} loading="lazy" />
        <span className="event-image-category">{event.category}</span>
      </button>
      <div className="event-card-copy">
        <div className="event-card-topline">
          <span className="event-date-line"><CalendarDays size={13} /> {formatDate(event.date)}</span>
          <button className={`save-button ${isSaved ? 'is-saved' : ''}`} onClick={() => onSave(event.id)} aria-label={isSaved ? 'Remove saved event' : 'Save event'}>
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <button className="event-title-button" onClick={() => onOpen(event)}><h3>{event.title}</h3><ArrowUpRight size={17} /></button>
        <p className="event-venue"><MapPin size={13} /> {event.city} <span>·</span> {formatTime(event.time)}</p>
        <div className="event-card-bottom"><span>{event.priceLabel}</span><button onClick={() => onOpen(event)}>Explore event <ArrowRight size={14} /></button></div>
      </div>
    </article>
  )
}

function ModalFrame({ children, onClose, wide = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-panel ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        {children}
      </section>
    </div>
  )
}

function EventDetails({ event, onClose, onRegister }) {
  return (
    <ModalFrame onClose={onClose} wide>
      <div className="details-layout">
        <div className="details-image-wrap"><img src={event.image} alt={event.title} /><span className="details-category">{event.category}</span></div>
        <div className="details-copy">
          <p className="eyebrow">THE DETAILS, BEAUTIFULLY SORTED <span>✳</span></p>
          <h2>{event.title}</h2>
          <p className="details-description">{event.description}</p>
          <div className="detail-facts">
            <div><CalendarDays size={17} /><span><small>DATE</small><b>{formatDate(event.date, { weekday: 'long', day: 'numeric', month: 'long' })}</b></span></div>
            <div><Clock3 size={17} /><span><small>TIME</small><b>{formatTime(event.time)} – {formatTime(event.endTime)}</b></span></div>
            <div><MapPin size={17} /><span><small>LOCATION</small><b>{event.venue}</b></span></div>
            <div><Ticket size={17} /><span><small>ADMISSION</small><b>{event.priceLabel}</b></span></div>
          </div>
          <div className="host-line"><span>HOSTED BY</span><b>{event.host}</b><span className="host-divider">✳</span><span>{event.capacity}</span></div>
          <button className="primary-button full-button" onClick={() => onRegister(event)}>Reserve your place <ArrowUpRight size={18} /></button>
          <p className="fine-print">Demo event listing · Registration details are saved in this browser.</p>
        </div>
      </div>
    </ModalFrame>
  )
}

function RegistrationModal({ initialEvent, onClose, onSubmit, allEvents }) {
  const [eventId, setEventId] = useState(initialEvent?.id || allEvents[0].id)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [confirmation, setConfirmation] = useState(null)
  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }
  const selectedEvent = allEvents.find((event) => event.id === eventId) || allEvents[0]

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) nextErrors.phone = 'Enter a valid phone number (10–15 digits).'
    if (!eventId) nextErrors.event = 'Please choose an event.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const record = onSubmit({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), eventId })
    setConfirmation(record)
  }

  return (
    <ModalFrame onClose={onClose}>
      {confirmation ? (
        <div className="confirmation-screen">
          <div className="success-mark"><Check size={27} /></div>
          <p className="eyebrow">YOU'RE ON THE LIST</p>
          <h2>It's a date,<br /><em>{form.name.split(' ')[0]}.</em></h2>
          <p className="confirmation-copy">Your place for <b>{selectedEvent.title}</b> is reserved. Your digital pass is ready — keep the QR code handy at the entrance.</p>
          <DigitalTicket booking={confirmation} event={selectedEvent} />
          <button className="primary-button full-button" onClick={onClose}>Back to the good stuff <ArrowRight size={17} /></button>
        </div>
      ) : (
        <div className="registration-content">
          <p className="eyebrow">ONE SMALL STEP TO A GOOD PLAN <span>✳</span></p>
          <h2>Save your<br /><em>place.</em></h2>
          <p className="modal-intro">A few details and you’re in. We’ll keep your spot warm.</p>
          <form onSubmit={submit} noValidate>
            <label className="form-field"><span>FULL NAME</span><input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Alex Morgan" autoComplete="name" />{errors.name && <small className="field-error">{errors.name}</small>}</label>
            <label className="form-field"><span>EMAIL ADDRESS</span><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />{errors.email && <small className="field-error">{errors.email}</small>}</label>
            <label className="form-field"><span>PHONE NUMBER</span><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" />{errors.phone && <small className="field-error">{errors.phone}</small>}</label>
            <label className="form-field"><span>CHOOSE YOUR EVENT</span><div className="select-wrap"><select value={eventId} onChange={(e) => { setEventId(e.target.value); setErrors((current) => ({ ...current, event: '' })) }}>{allEvents.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select><ChevronDown size={17} /></div>{errors.event && <small className="field-error">{errors.event}</small>}</label>
            <div className="registration-summary"><span>{formatDate(selectedEvent.date, { day: 'numeric', month: 'short' })} · {selectedEvent.city}</span><b>{selectedEvent.priceLabel}</b></div>
            <button className="primary-button full-button" type="submit">Confirm registration <ArrowUpRight size={18} /></button>
          </form>
          <p className="fine-print">Your details stay in this browser for this demo. No payment is collected.</p>
        </div>
      )}
    </ModalFrame>
  )
}

function BookingsModal({ bookings, onClose }) {
  const [expandedTicket, setExpandedTicket] = useState(null)
  return (
    <ModalFrame onClose={onClose}>
      <div className="bookings-content">
        <p className="eyebrow">YOUR PLANS, ALL IN ONE PLACE</p>
        <h2>My <em>passes.</em></h2>
        {bookings.length ? <div className="booking-list">{[...bookings].reverse().map((booking) => {
          const item = events.find((event) => event.id === booking.eventId)
          if (!item) return null
          const isExpanded = expandedTicket === booking.code
          return (
            <div className="booking-entry" key={booking.code}>
              <div className="booking-item">
                <div className="booking-date"><b>{new Date(`${item.date}T12:00:00`).getDate()}</b><span>{new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(`${item.date}T12:00:00`))}</span></div>
                <div className="booking-info"><b>{item.title}</b><span>{item.city} · {formatTime(item.time)}</span><small>{booking.code}</small></div>
                <Check size={18} className="booking-check" />
                <button className="view-ticket-button" onClick={() => setExpandedTicket(isExpanded ? null : booking.code)} aria-expanded={isExpanded}><QrCode size={14} /> {isExpanded ? 'Hide' : 'View ticket'}</button>
              </div>
              {isExpanded && <DigitalTicket booking={booking} event={item} />}
            </div>
          )
        })}</div> : <div className="empty-bookings"><div className="empty-icon"><Ticket size={25} /></div><h3>No plans on the calendar.</h3><p>Find something worth stepping out for and your passes will show up here.</p></div>}
        <button className="secondary-button full-button" onClick={onClose}>Close</button>
      </div>
    </ModalFrame>
  )
}

function App() {
  const [theme, setTheme] = useState(() => readStorage('morrow-theme', 'light'))
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All events')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState('any')
  const [priceFilter, setPriceFilter] = useState('any')
  const [cityFilter, setCityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('soonest')
  const [saved, setSaved] = useState(() => readStorage('morrow-saved', []))
  const [bookings, setBookings] = useState(() => readStorage('morrow-bookings', []))
  const [detailEvent, setDetailEvent] = useState(null)
  const [registrationEvent, setRegistrationEvent] = useState(null)
  const [bookingsOpen, setBookingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  useEffect(() => {
    localStorage.setItem('morrow-theme', JSON.stringify(theme))
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => { localStorage.setItem('morrow-saved', JSON.stringify(saved)) }, [saved])
  useEffect(() => { localStorage.setItem('morrow-bookings', JSON.stringify(bookings)) }, [bookings])

  const visibleEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const now = new Date()
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + 7)
    const endOfMonth = new Date(now)
    endOfMonth.setDate(now.getDate() + 30)
    return events.filter((event) => {
      const matchesQuery = !normalized || [event.title, event.category, event.venue, event.city, event.description].some((value) => value.toLowerCase().includes(normalized))
      const matchesCategory = category === 'All events' || event.category === category
      const eventDate = new Date(`${event.date}T23:59:00`)
      const matchesDate = dateFilter === 'any' || (dateFilter === 'week' && eventDate >= now && eventDate <= endOfWeek) || (dateFilter === 'month' && eventDate >= now && eventDate <= endOfMonth)
      const matchesPrice = priceFilter === 'any' || (priceFilter === 'free' && event.price === 0) || (priceFilter === 'paid' && event.price > 0)
      const matchesCity = cityFilter === 'all' || event.city === cityFilter
      const matchesSaved = !showSavedOnly || saved.includes(event.id)
      return matchesQuery && matchesCategory && matchesDate && matchesPrice && matchesCity && matchesSaved
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      return new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`)
    })
  }, [query, category, dateFilter, priceFilter, cityFilter, sortBy, showSavedOnly, saved])

  const featured = events.find((event) => event.featured)
  const toggleSaved = (id) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const openRegistration = (event) => {
    setDetailEvent(null)
    setRegistrationEvent(event || featured)
  }
  const saveRegistration = (details) => {
    const record = { ...details, code: `MRW-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() }
    setBookings((current) => [...current, record])
    return record
  }
  const clearFilters = () => {
    setQuery(''); setCategory('All events'); setDateFilter('any'); setPriceFilter('any'); setCityFilter('all'); setSortBy('soonest'); setShowSavedOnly(false)
  }

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Morrow home"><span className="brand-symbol">m<span>✳</span></span><span className="brand-word">morrow<span>.</span></span></a>
        <nav className={`main-nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <a href="#events" onClick={() => setMobileMenuOpen(false)}>Discover</a>
          <button onClick={() => { setShowSavedOnly(true); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false) }}>Saved <span className="nav-count">{saved.length}</span></button>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>Our point of view</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
          <button className="passes-button" onClick={() => setBookingsOpen(true)}><Ticket size={15} /> My passes <span>{bookings.length}</span></button>
          <button className="mobile-menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation">{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-kicker"><span className="kicker-star">✳</span> A CITY GUIDE FOR THE CURIOUS</div>
            <h1>Find your next<br /><em>favourite</em> thing.</h1>
            <p className="hero-description">Good nights, fresh ideas, new faces. A considered collection of things happening near and far — so your calendar feels like yours again.</p>
            <div className="hero-actions"><a href="#events" className="primary-button">Find something to do <ArrowUpRight size={17} /></a><span>Not more screen time. Better real time.</span></div>
            <div className="hero-bottom-note"><span>01 / 08</span><i /> THE NOVEMBER — DECEMBER EDITION</div>
          </div>
          <div className="hero-image-wrap">
            <img src={featured.image} alt="A crowd at a live music event" />
            <div className="hero-image-shade" />
            <div className="hero-image-top"><span>THE WEEKEND, WELL SPENT</span><span>✳</span></div>
            <div className="hero-image-caption"><small>14 NOVEMBER · BHUBANESWAR</small><b>Leave room<br />for a little <em>magic.</em></b></div>
            <div className="hero-image-sticker"><span>GO</span><span>OUT</span><b>↗</b></div>
          </div>
          <div className="hero-vertical-label">COLLECT MOMENTS, NOT TABS</div>
        </section>

        <section className="discovery-section" aria-label="Find events">
          <div className="discovery-topline"><div><span className="eyebrow">THE GOOD STUFF STARTS HERE</span><h2>What feels like <em>you?</em></h2></div><p>Search a mood, a city or a name.<br />We’ll handle the rest.</p></div>
          <div className="search-tools">
            <div className="search-box"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try ‘live music’, ‘Bengaluru’ or ‘art’..." aria-label="Search events" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}</div>
            <button className={`filter-toggle ${advancedOpen ? 'filter-active' : ''}`} onClick={() => setAdvancedOpen(!advancedOpen)} aria-expanded={advancedOpen}><SlidersHorizontal size={17} /><span>Refine</span><span className="filter-indicator">{[dateFilter !== 'any', priceFilter !== 'any', cityFilter !== 'all', sortBy !== 'soonest'].filter(Boolean).length || ''}</span></button>
          </div>
          {advancedOpen && <div className="advanced-panel">
            <div className="advanced-title"><div><span className="eyebrow">MAKE IT A LITTLE MORE SPECIFIC</span><b>Fine-tune your plans</b></div><button onClick={clearFilters}>Clear all <X size={13} /></button></div>
            <label><span>WHEN</span><select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}><option value="any">Any time</option><option value="week">Next 7 days</option><option value="month">Next 30 days</option></select></label>
            <label><span>PRICE</span><select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}><option value="any">Any price</option><option value="free">Free events</option><option value="paid">Paid events</option></select></label>
            <label><span>LOCATION</span><select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}><option value="all">All cities</option>{[...new Set(events.map((event) => event.city))].sort().map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
            <label><span>SORT BY</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="soonest">Happening soon</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
          </div>}
          <div className="category-row"><div className="category-list">{categories.map((item) => <button key={item} className={`category-chip ${category === item ? 'active' : ''}`} onClick={() => { setCategory(item); setShowSavedOnly(false) }}>{item}</button>)}</div><button className={`saved-filter ${showSavedOnly ? 'active' : ''}`} onClick={() => setShowSavedOnly(!showSavedOnly)}><Heart size={14} fill={showSavedOnly ? 'currentColor' : 'none'} /> Saved <span>{saved.length}</span></button></div>
        </section>

        <section className="featured-section" aria-label="Featured event">
          <div className="section-heading-line"><div><span className="section-index">01</span><div><span className="eyebrow">A LITTLE SOMETHING SPECIAL</span><h2>On our <em>radar.</em></h2></div></div><span className="editor-label"><i /> THE EDITOR’S PICK</span></div>
          <div className="featured-card">
            <div className="featured-image"><img src={featured.image} alt="Night Shift rooftop live music event" /><div className="featured-image-overlay" /><span className="featured-image-tag">MORROW SELECTS <span>✳</span></span><div className="featured-image-title"><span>LIVE / LOUD / LOCAL</span><b>Night<br /><em>Shift.</em></b></div><span className="featured-image-foot">A NIGHT TO FEEL SOMETHING.</span></div>
            <div className="featured-details">
              <div className="featured-topline"><span className="pill-tag">{featured.category}</span><button className={`save-featured ${saved.includes(featured.id) ? 'is-saved' : ''}`} onClick={() => toggleSaved(featured.id)}><Heart size={16} fill={saved.includes(featured.id) ? 'currentColor' : 'none'} /> {saved.includes(featured.id) ? 'Saved' : 'Save for later'}</button></div>
              <p className="eyebrow">{formatDate(featured.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</p>
              <h3>Night Shift:<br /><em>Rooftop Sessions</em></h3>
              <p className="featured-description">A rooftop, a late-night breeze and sounds worth staying up for. Three independent acts, one open sky.</p>
              <div className="featured-facts"><span><MapPin size={14} /> The Terrace, Bhubaneswar</span><span><Clock3 size={14} /> {formatTime(featured.time)} onwards</span></div>
              <div className="countdown-wrap"><span className="countdown-label">THE NIGHT BEGINS IN</span><Countdown date={featured.date} time={featured.time} /></div>
              <div className="featured-bottom"><div><small>STARTING AT</small><b>₹799 <span>/ person</span></b></div><button className="primary-button" onClick={() => setDetailEvent(featured)}>Explore the event <ArrowUpRight size={17} /></button></div>
            </div>
          </div>
        </section>

        <section className="events-section" id="events">
          <div className="events-section-top"><div><span className="section-index">02</span><div><span className="eyebrow">A CALENDAR WITH CHARACTER</span><h2>{showSavedOnly ? <>Your <em>shortlist.</em></> : <>The event <em>edit.</em></>}</h2></div></div><p>{visibleEvents.length.toString().padStart(2, '0')} GOOD REASONS TO GO OUT</p></div>
          <div className="events-intro"><p>{showSavedOnly ? 'The things you bookmarked for another day.' : 'A hand-picked mix of music, ideas, food and culture. Pick a date. Make a memory.'}</p><a href="#top" className="text-link" onClick={() => { clearFilters(); setShowSavedOnly(false) }}>Reset discovery <ArrowUpRight size={14} /></a></div>
          {visibleEvents.length ? <div className="events-grid">{visibleEvents.map((event) => <EventCard key={event.id} event={event} onOpen={setDetailEvent} isSaved={saved.includes(event.id)} onSave={toggleSaved} />)}</div> : <div className="no-results"><div className="no-results-icon"><Compass size={25} /></div><h3>Nothing on this page yet.</h3><p>Try a different search or clear a few filters. Your next great plan is still out there.</p><button className="secondary-button" onClick={clearFilters}>Clear all filters <ArrowRight size={16} /></button></div>}
        </section>

        <section className="manifesto-section" id="about"><div className="manifesto-left"><span className="manifesto-star">✳</span><span className="eyebrow">A THOUGHT TO TAKE WITH YOU</span></div><div className="manifesto-copy"><h2>Make plans.<br /><em>Make memories.</em></h2><p>There’s a whole world happening just outside your usual routine. We bring the interesting bits together — so you can spend less time looking and more time living.</p><a href="#events" className="manifesto-link">Find your next thing <ArrowUpRight size={16} /></a></div><div className="manifesto-mark">M.<span>2026</span></div></section>
      </main>

      <footer className="site-footer">
        <div className="footer-identity"><a href="#top" className="footer-brand"><span className="brand-symbol">m<span>✳</span></span><span className="brand-word">morrow<span>.</span></span></a><p>For the moments that make a day.</p></div>
        <div className="footer-contacts" aria-label="Morrow contact accounts">
          <div className="footer-contact"><FooterContactIcon kind="email" /><span>hello@morrow.events</span></div>
          <div className="footer-contact"><FooterContactIcon kind="instagram" /><span>@morrow.events</span></div>
          <div className="footer-contact"><FooterContactIcon kind="facebook" /><span>Morrow Events</span></div>
        </div>
        <div className="footer-right"><span>FIND YOUR OUT-THERE.</span><span>© 2026 MORROW</span></div>
      </footer>

      {detailEvent && <EventDetails event={detailEvent} onClose={() => setDetailEvent(null)} onRegister={openRegistration} />}
      {registrationEvent && <RegistrationModal key={registrationEvent.id} initialEvent={registrationEvent} onClose={() => setRegistrationEvent(null)} onSubmit={saveRegistration} allEvents={events} />}
      {bookingsOpen && <BookingsModal bookings={bookings} onClose={() => setBookingsOpen(false)} />}
    </div>
  )
}

export default App
