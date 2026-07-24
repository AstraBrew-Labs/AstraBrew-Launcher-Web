import { permanentRedirect } from 'next/navigation'

export default function LegacyAboutPage() {
  permanentRedirect('/zh/about')
}
