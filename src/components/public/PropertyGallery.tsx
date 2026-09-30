'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PropertyGalleryProps {
  images: string[]
  title: string
  operationLabel: string
  reference: string
}

export function PropertyGallery({ images, title, operationLabel, reference }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] ?? '')

  return (
    <div className="space-y-3">
      <div className="relative h-72 overflow-hidden rounded-xl bg-muted md:h-[460px]">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 66vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge className="bg-emerald-700 text-white">{operationLabel}</Badge>
          <Badge variant="secondary">{reference}</Badge>
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.slice(0, 6).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-muted transition ${
                activeImage === image ? 'ring-2 ring-emerald-600 ring-offset-2' : 'hover:opacity-90'
              }`}
              aria-label={`Afficher l'image ${index + 1}`}
            >
              <Image src={image} alt={`${title} ${index + 1}`} fill sizes="160px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
