'use client'

import { Button } from '@/components/ui/button'
import { SUNULOGIS_CONTACT } from '@/lib/constants'
import { getWhatsAppPropertyLink } from '@/lib/real-estate'
import { CalendarCheck, FileText, MessageCircle, Phone } from 'lucide-react'

interface PropertyContactActionsProps {
  propertyId?: string
  reference: string
  title: string
  location: string
  compact?: boolean
  stickyMobile?: boolean
}

export function PropertyContactActions({
  propertyId,
  reference,
  title,
  location,
  compact = false,
  stickyMobile = false,
}: PropertyContactActionsProps) {
  const openWhatsApp = (intent: 'visit' | 'file' | 'contact') => {
    if (propertyId) {
      void fetch(`/api/establishments/${propertyId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsapp' }),
      })
    }

    window.open(getWhatsAppPropertyLink({ reference, title, location, intent }), '_blank', 'noopener,noreferrer')
  }

  const content = (
    <>
      <Button className="gap-2" onClick={() => openWhatsApp('visit')}>
        <CalendarCheck className="h-4 w-4" />
        Demander une visite
      </Button>
      {!compact && (
        <Button variant="outline" className="gap-2" onClick={() => openWhatsApp('file')}>
          <FileText className="h-4 w-4" />
          Demander le dossier
        </Button>
      )}
      <Button variant="outline" className="gap-2" onClick={() => openWhatsApp('contact')}>
        <MessageCircle className="h-4 w-4 text-green-600" />
        WhatsApp
      </Button>
      <Button variant="secondary" className="gap-2" asChild>
        <a href={`tel:${SUNULOGIS_CONTACT.phoneHref}`}>
          <Phone className="h-4 w-4" />
          Appeler SunuLogis
        </a>
      </Button>
    </>
  )

  if (stickyMobile) {
    return (
      <>
        <div className="hidden flex-col gap-3 sm:flex">
          {content}
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Button className="gap-2" onClick={() => openWhatsApp('visit')}>
              <CalendarCheck className="h-4 w-4" />
              Visite
            </Button>
            <Button variant="secondary" className="gap-2" asChild>
              <a href={`tel:${SUNULOGIS_CONTACT.phoneHref}`}>
                <Phone className="h-4 w-4" />
                Appeler
              </a>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return <div className="flex flex-col gap-3">{content}</div>
}

