import { permanentRedirect } from 'next/navigation'

export default function LegacyDownloadPage() {
  permanentRedirect('/zh/download')
}
