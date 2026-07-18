import { Button, Card, CardBody, Input, OfferStatusPill, type OfferStatus } from "@viacerta/ui";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useCareerSuccess, useSaveOffers } from "./useCareerSuccess";

type FormValues = {
  offers: { id?: string; company: string; role: string; location: string; salary: string; status: OfferStatus }[];
};

export function OfferTrackerPanel() {
  const { data: careerSuccess, isLoading } = useCareerSuccess();
  const saveOffers = useSaveOffers();

  const { control, register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { offers: [] } });
  const { fields, append, remove } = useFieldArray({ control, name: "offers" });

  const offers = careerSuccess?.offers ?? [];

  useEffect(() => {
    if (careerSuccess) {
      reset({
        offers: offers.map((o) => ({
          id: o.id,
          company: o.company,
          role: o.role,
          location: o.location ?? "",
          salary: o.salary ?? "",
          status: o.status as OfferStatus,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerSuccess, reset]);

  if (isLoading || !careerSuccess) return null;

  const activeCount = offers.filter((o) => o.status !== "REJECTED" && o.status !== "DECLINED").length;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Offer Tracker</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{activeCount} active</span>
        </div>

        <div className="space-y-2">
          {offers.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-navy-700"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-700 dark:bg-navy-700 dark:text-mint-400">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{o.company}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {[o.role, o.location, o.salary].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <OfferStatusPill status={o.status as OfferStatus} />
            </div>
          ))}
        </div>

        <form
          className="space-y-3 border-t border-gray-100 pt-4 dark:border-navy-700"
          onSubmit={handleSubmit((values) =>
            saveOffers.mutate({
              offers: values.offers.map((o) => ({
                id: o.id ?? null,
                company: o.company,
                role: o.role,
                location: o.location || null,
                salary: o.salary || null,
                status: o.status,
              })),
            }),
          )}
        >
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Input placeholder="Company" {...register(`offers.${i}.company` as const)} />
              <Input placeholder="Role" {...register(`offers.${i}.role` as const)} />
              <Input placeholder="Location" {...register(`offers.${i}.location` as const)} />
              <Input placeholder="Salary" {...register(`offers.${i}.salary` as const)} />
              <div className="flex items-center gap-1">
                <select
                  className="h-9 flex-1 rounded-md border border-gray-300 px-2 text-sm dark:border-navy-600 dark:bg-navy-800 dark:text-gray-100"
                  {...register(`offers.${i}.status` as const)}
                >
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="FINAL_ROUND">Final Round</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DECLINED">Declined</option>
                </select>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({ company: "", role: "", location: "", salary: "", status: "APPLIED" })
              }
            >
              <Plus className="mr-1 h-4 w-4" /> Add application
            </Button>
            <Button type="submit" variant="accent" size="sm" disabled={saveOffers.isPending}>
              {saveOffers.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
