import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { aapi } from '../adminApi'
import { PageHeader, Section, Spinner, ErrorState } from '../ui'

// Reusable field helpers
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="a-field"><label className="a-label">{label}</label>{children}</div>
}

const CSV = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean)

export default function HostelEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [f, setF] = useState<any>(isNew ? blank() : null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isNew) aapi.get(`/hostels/${id}`).then(h => setF(fromShape(h))).catch(e => setError(e.message))
  }, [id])

  if (error) return <ErrorState message={error} />
  if (!f) return <Spinner />
  const set = (k: string, v: any) => setF({ ...f, [k]: v })

  const save = async () => {
    setBusy(true); setError('')
    try {
      const body = {
        name: f.name, shortDesc: f.shortDesc, description: f.description, propertyType: f.propertyType,
        destination: f.destination, city: f.city, state: f.state, country: f.country, locality: f.locality,
        address: f.address, postalCode: f.postalCode, latitude: f.latitude, longitude: f.longitude,
        area: f.city, pricePerNight: f.pricePerNight, email: f.email, phone: f.phone, website: f.website,
        coverImage: f.coverImage, checkinTime: f.checkinTime, checkoutTime: f.checkoutTime,
        rules: f.rules, cancellation: f.cancellation, bookingUrl: f.bookingUrl,
        seoTitle: f.seoTitle, seoDescription: f.seoDescription, externalRef: f.externalRef,
        amenities: CSV(f.amenities), vibeTags: CSV(f.vibeTags), highlights: CSV(f.highlights),
        suitableFor: CSV(f.suitableFor), gallery: CSV(f.gallery), categories: CSV(f.categories), tags: CSV(f.tags),
      }
      if (isNew) { const h = await aapi.post('/hostels', body); await aapi.put(`/hostels/${h.id}`, body); navigate(`/admin/hostels/${h.id}`) }
      else { await aapi.put(`/hostels/${id}`, body); navigate(`/admin/hostels/${id}`) }
    } catch (e: any) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="a-page">
      <PageHeader breadcrumbs={[{ label: 'Hostels', to: '/admin/hostels' }, { label: isNew ? 'Add hostel' : 'Edit' }]} title={isNew ? 'Add hostel' : `Edit ${f.name}`}
        actions={<><button className="a-btn" onClick={() => navigate(-1)}>Cancel</button><button className="a-btn a-btn-primary" disabled={busy || !f.name} onClick={save}>{busy ? 'Saving…' : 'Save'}</button></>} />
      {error && <p className="a-error">{error}</p>}

      <div className="a-editor-cols">
        <Section title="Basic information">
          <Field label="Hostel name"><input className="a-input" value={f.name} onChange={e => set('name', e.target.value)} /></Field>
          <Field label="Short description"><input className="a-input" value={f.shortDesc} onChange={e => set('shortDesc', e.target.value)} /></Field>
          <Field label="Detailed description"><textarea className="a-input" rows={4} value={f.description} onChange={e => set('description', e.target.value)} /></Field>
          <Field label="Property type"><select className="a-input" value={f.propertyType} onChange={e => set('propertyType', e.target.value)}>{['hostel', 'hotel', 'homestay', 'guesthouse', 'camp', 'resort', 'coliving'].map(v => <option key={v}>{v}</option>)}</select></Field>
        </Section>

        <Section title="Location">
          <div className="a-grid2">
            <Field label="Country"><input className="a-input" value={f.country} onChange={e => set('country', e.target.value)} /></Field>
            <Field label="State"><input className="a-input" value={f.state} onChange={e => set('state', e.target.value)} /></Field>
            <Field label="City"><input className="a-input" value={f.city} onChange={e => set('city', e.target.value)} /></Field>
            <Field label="Locality"><input className="a-input" value={f.locality} onChange={e => set('locality', e.target.value)} /></Field>
            <Field label="Destination slug"><input className="a-input" value={f.destination} onChange={e => set('destination', e.target.value)} placeholder="manali" /></Field>
            <Field label="Postal code"><input className="a-input" value={f.postalCode} onChange={e => set('postalCode', e.target.value)} /></Field>
          </div>
          <Field label="Full address"><input className="a-input" value={f.address} onChange={e => set('address', e.target.value)} /></Field>
          <div className="a-grid2">
            <Field label="Latitude"><input className="a-input" value={f.latitude} onChange={e => set('latitude', e.target.value)} /></Field>
            <Field label="Longitude"><input className="a-input" value={f.longitude} onChange={e => set('longitude', e.target.value)} /></Field>
          </div>
        </Section>

        <Section title="Details & pricing">
          <Field label="Price per night (₹)"><input className="a-input" inputMode="numeric" value={f.pricePerNight} onChange={e => set('pricePerNight', e.target.value.replace(/\D/g, ''))} /></Field>
          <Field label="Amenities (comma-separated)"><input className="a-input" value={f.amenities} onChange={e => set('amenities', e.target.value)} placeholder="wifi, cafe, bonfire" /></Field>
          <Field label="Vibe tags"><input className="a-input" value={f.vibeTags} onChange={e => set('vibeTags', e.target.value)} placeholder="social, chill" /></Field>
          <Field label="Highlights"><input className="a-input" value={f.highlights} onChange={e => set('highlights', e.target.value)} /></Field>
          <div className="a-grid2">
            <Field label="Check-in time"><input className="a-input" value={f.checkinTime} onChange={e => set('checkinTime', e.target.value)} placeholder="12:00" /></Field>
            <Field label="Check-out time"><input className="a-input" value={f.checkoutTime} onChange={e => set('checkoutTime', e.target.value)} placeholder="10:00" /></Field>
          </div>
          <Field label="Property rules"><textarea className="a-input" rows={2} value={f.rules} onChange={e => set('rules', e.target.value)} /></Field>
          <Field label="Cancellation policy"><textarea className="a-input" rows={2} value={f.cancellation} onChange={e => set('cancellation', e.target.value)} /></Field>
        </Section>

        <Section title="Contact & media">
          <div className="a-grid2">
            <Field label="Email"><input className="a-input" value={f.email} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="Phone"><input className="a-input" value={f.phone} onChange={e => set('phone', e.target.value)} /></Field>
          </div>
          <Field label="Website"><input className="a-input" value={f.website} onChange={e => set('website', e.target.value)} placeholder="https://…" /></Field>
          <Field label="Cover image URL (https)"><input className="a-input" value={f.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://…" /></Field>
          {f.coverImage && <div className="a-cover" style={{ backgroundImage: `url(${f.coverImage})` }} />}
          <Field label="Gallery image URLs (comma-separated)"><input className="a-input" value={f.gallery} onChange={e => set('gallery', e.target.value)} /></Field>
        </Section>

        <Section title="Booking & discovery">
          <Field label="Official booking URL (https)"><input className="a-input" value={f.bookingUrl} onChange={e => set('bookingUrl', e.target.value)} placeholder="https://…" /></Field>
          <Field label="Categories"><input className="a-input" value={f.categories} onChange={e => set('categories', e.target.value)} /></Field>
          <Field label="Tags"><input className="a-input" value={f.tags} onChange={e => set('tags', e.target.value)} /></Field>
          <div className="a-grid2">
            <Field label="SEO title"><input className="a-input" value={f.seoTitle} onChange={e => set('seoTitle', e.target.value)} /></Field>
            <Field label="External ID"><input className="a-input" value={f.externalRef} onChange={e => set('externalRef', e.target.value)} /></Field>
          </div>
          <Field label="SEO description"><textarea className="a-input" rows={2} value={f.seoDescription} onChange={e => set('seoDescription', e.target.value)} /></Field>
          <p className="a-muted a-small">New hostels are created as <strong>draft</strong>. Publish from the hostel detail page after review — publishing validates required fields.</p>
        </Section>
      </div>
    </div>
  )
}

function blank() {
  return { propertyType: 'hostel', country: 'India', name: '', shortDesc: '', description: '', destination: '', city: '', state: '', locality: '', address: '', postalCode: '', latitude: '', longitude: '', pricePerNight: '', email: '', phone: '', website: '', coverImage: '', checkinTime: '', checkoutTime: '', rules: '', cancellation: '', bookingUrl: '', seoTitle: '', seoDescription: '', externalRef: '', amenities: '', vibeTags: '', highlights: '', suitableFor: '', gallery: '', categories: '', tags: '' }
}
function fromShape(h: any) {
  const join = (a: any[]) => (a || []).join(', ')
  return {
    ...blank(), name: h.name || '', shortDesc: h.shortDesc || '', description: h.description || '', propertyType: h.propertyType || 'hostel',
    destination: h.destination || '', city: h.city || '', state: h.state || '', country: h.country || 'India', locality: h.locality || '',
    address: h.address || '', postalCode: h.postalCode || '', latitude: h.latitude ?? '', longitude: h.longitude ?? '', pricePerNight: h.pricePerNight ?? '',
    email: h.email || '', phone: h.phone || '', website: h.website || '', coverImage: h.coverImage || '', checkinTime: h.checkinTime || '', checkoutTime: h.checkoutTime || '',
    rules: h.rules || '', cancellation: h.cancellation || '', bookingUrl: h.bookingUrl || '', seoTitle: h.seoTitle || '', seoDescription: h.seoDescription || '', externalRef: h.externalRef || '',
    amenities: join(h.amenities), vibeTags: join(h.vibeTags), highlights: join(h.highlights), suitableFor: join(h.suitableFor), gallery: join(h.gallery), categories: join(h.categories), tags: join(h.tags),
  }
}
