import Playground from "../../playground/playground";
import { isLocale, locales, type Locale } from "../../../lib/content-types";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default function LocalePlayground({ params }: { params: { locale: string } }) { const locale: Locale = isLocale(params.locale) ? params.locale : "en"; return <Playground locale={locale} />; }
