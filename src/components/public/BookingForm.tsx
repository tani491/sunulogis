'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays, User, Phone, MessageCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { parseJsonResponse } from '@/lib/fetch-json'

interface Room {
  id: string
  name: string
  pricePerNight: number
  capacity: number
}

interface Establishment {
  id: string
  name: string
  phone?: string
}

interface BookingFormProps {
  room: Room
  establishment: Establishment
  open: boolean
  onClose: () => void
}

export function BookingForm({ room, establishment, open, onClose }: BookingFormProps) {
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingCreated, setBookingCreated] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!guestName.trim() || !guestPhone.trim() || !startDate || !endDate) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      toast.error('La date de départ doit être après la date d\'arrivée')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          guestName,
          guestPhone,
          startDate,
          endDate,
        }),
      })

      const data = await parseJsonResponse<{ error?: string }>(res)

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la réservation')
        return
      }

      toast.success('Réservation créée avec succès !')
      setBookingCreated(true)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getWhatsAppLink = () => {
    const message = `Bonjour, je suis ${guestName}. J'ai vu votre offre dans SunuLogis et Je souhaite réserver la chambre ${room.name} du ${format(new Date(startDate), 'dd MMMM yyyy', { locale: fr })} au ${format(new Date(endDate), 'dd MMMM yyyy', { locale: fr })}. Merci de confirmer.`
    const phone = establishment.phone?.replace(/^(\+)/, '') || ''
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  const handleClose = () => {
    setGuestName('')
    setGuestPhone('')
    setStartDate('')
    setEndDate('')
    setBookingCreated(false)
    onClose()
  }

  const nights = startDate && endDate ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Réserver - {room.name}
          </DialogTitle>
          <DialogDescription>
            {room.pricePerNight.toLocaleString()} FCFA / nuit · {room.capacity} personne{room.capacity > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {!bookingCreated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Nom complet
              </Label>
              <Input
                id="guestName"
                placeholder="Votre nom complet"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                Téléphone
              </Label>
              <Input
                id="guestPhone"
                placeholder="221770000000"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date d&apos;arrivée</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de départ</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="rounded-lg bg-primary/5 p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{nights} nuit{nights > 1 ? 's' : ''} × {room.pricePerNight.toLocaleString()} FCFA</span>
                  <span className="font-semibold">{(nights * room.pricePerNight).toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Réservation enregistrée !</h3>
            <p className="text-sm text-muted-foreground">
              Votre réservation est en attente de confirmation. Contactez l&apos;établissement via WhatsApp pour confirmer.
            </p>

            {establishment.phone && (
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => window.open(getWhatsAppLink(), '_blank')}
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
                Confirmer via WhatsApp
              </Button>
            )}

            <Button variant="ghost" className="w-full" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
