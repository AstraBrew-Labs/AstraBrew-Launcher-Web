import { permanentRedirect } from 'next/navigation'

export default function LegacyGuidePage() {
  permanentRedirect('/zh/guide')
}
