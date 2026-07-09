import { AsyncBoundary, Button, Input, Label } from "@viacerta/ui";
import { format } from "date-fns";
import { useState } from "react";

import { useBookSession1 } from "./useBookSession1";
import { useSession1Availability } from "./useSession1Availability";

function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function SlotPicker() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [date, setDate] = useState(toDateInputValue(tomorrow));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const availability = useSession1Availability(date);
  const book = useBookSession1();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="session1-date">Choose a date</Label>
        <Input
          id="session1-date"
          type="date"
          min={toDateInputValue(today)}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSlot(null);
          }}
          className="mt-1 max-w-xs"
        />
      </div>

      <AsyncBoundary
        isLoading={availability.isLoading}
        error={availability.error}
        data={availability.data}
        errorFallback={() => <p className="text-sm text-flag-red-solid">Could not load available times.</p>}
      >
        {(data) =>
          data.slots.length === 0 ? (
            <p className="text-sm text-gray-600">No times available this day — try another date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {data.slots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedSlot === slot ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSlot(slot)}
                >
                  {format(new Date(slot), "p")}
                </Button>
              ))}
            </div>
          )
        }
      </AsyncBoundary>

      {book.isError && <p className="text-sm text-flag-red-solid">Could not book this slot. Please try again.</p>}

      <Button
        type="button"
        disabled={!selectedSlot}
        loading={book.isPending}
        onClick={() => selectedSlot && book.mutate({ scheduledAt: selectedSlot })}
      >
        Confirm Session 1 time
      </Button>
    </div>
  );
}
