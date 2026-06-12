'use client'

import { UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * SubmitToAiSearchButton — quiet blue-outline secondary header action.
 *
 * Mirrors /analytics' ExportButton: deliberately NOT the page focal. The 64px
 * blue hero figure is the only TIER-1 element; this stays a recessive utility
 * affordance in the header action slot.
 */
export function SubmitToAiSearchButton() {
  return (
    <Button variant="outline" size="default" className="gap-2" aria-label="Submit your site to AI search">
      <UploadCloud className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
      Submit to AI Search
    </Button>
  )
}
