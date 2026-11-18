import { requestRegion } from "@/lib/request-region";
import { connection } from "next/server";
import { type Locale } from "@/lib/i18n";
import { WindowsReleaseLinks } from "./windows-release-links";
export { WindowsDownloadsLoading } from "./windows-release-links";

export async function WindowsDownloads({ locale }: { locale: Locale }) {
  await connection();
  const region = await requestRegion();
  return <WindowsReleaseLinks locale={locale} region={region} />;
}
