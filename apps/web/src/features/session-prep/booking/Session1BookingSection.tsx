import { ApiError } from "@viacerta/api-client";
import { Card, CardBody } from "@viacerta/ui";
import { formatDateTime } from "@viacerta/utils";

import { SlotPicker } from "./SlotPicker";
import { useSession1Booking } from "./useSession1Booking";

export function Session1BookingSection() {
  const booking = useSession1Booking();

  if (booking.isLoading) return null;

  if (booking.data) {
    const { scheduledAt, advisorName, durationMinutes } = booking.data;
    return (
      <Card>
        <CardBody className="space-y-1">
          <h3 className="font-medium text-gray-900">Session 1 is booked</h3>
          <p className="text-sm text-gray-600">
            {formatDateTime(scheduledAt)} ({durationMinutes} min)
            {advisorName ? ` with ${advisorName}` : ""}
          </p>
        </CardBody>
      </Card>
    );
  }

  if (booking.error instanceof ApiError && booking.error.status === 404) {
    return (
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Schedule your Session 1 meeting</h3>
            <p className="text-sm text-gray-600">Pick a 45-minute slot with your advisor, available 10:00–19:00 daily.</p>
          </div>
          <SlotPicker />
        </CardBody>
      </Card>
    );
  }

  return <p className="text-sm text-flag-red-solid">Could not load your Session 1 booking.</p>;
}
