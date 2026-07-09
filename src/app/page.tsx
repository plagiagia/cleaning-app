import { getServices } from "@/app/actions/services";
import { BookingApp } from "@/components/booking-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await getServices();

  return <BookingApp services={services} />;
}
