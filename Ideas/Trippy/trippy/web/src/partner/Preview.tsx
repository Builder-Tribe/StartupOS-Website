import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { papi } from './partnerApi'
import { Spinner } from '../components'
import TripDetailsView from '../TripDetailsView'

export default function Preview() {
  const { id } = useParams()
  const [trip, setTrip] = useState<any>(null)

  useEffect(() => { papi.get(`/trips/${id}/preview`).then(setTrip) }, [id])
  if (!trip) return <Spinner />

  return (
    <div className="fade-up">
      <div className="crm-editor-head">
        <Link to={`/partner/trips/${id}`} className="back-link">← Back to editor</Link>
        <Link to={`/partner/trips/${id}`} className="btn btn-secondary small">Edit this trip</Link>
      </div>
      <TripDetailsView trip={trip} mode="preview" />
    </div>
  )
}
