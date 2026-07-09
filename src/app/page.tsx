import { getServices } from "@/app/actions/services";
import { BookingApp } from "@/components/booking-app";
import { LocaleProvider } from "@/lib/i18n/context";

export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await getServices();

  return (
    <LocaleProvider>
      <BookingApp services={services} />
    </LocaleProvider>
  );
}
