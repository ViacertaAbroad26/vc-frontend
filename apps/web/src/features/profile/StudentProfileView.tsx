import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncBoundary, Badge, Button, Card, CardBody, Input, Label, Textarea } from "@viacerta/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ProfileStepper } from "./ProfileStepper";
import {
  emptyProfileFormValues,
  formValuesToApplicationProfile,
  parseTargetCountries,
  profileToFormValues,
  ProfileSchema,
  type ProfileFormValues,
} from "./profile-schema";
import { useCreateChangeRequest } from "./useCreateChangeRequest";
import { useProfileChangeRequests } from "./useProfileChangeRequests";
import { useStudentProfile } from "./useStudentProfile";
import { useSubmitProfile } from "./useSubmitProfile";
import { useUpdateStudentProfile } from "./useUpdateStudentProfile";

export function StudentProfileView() {
  const { data, isLoading, error } = useStudentProfile();
  const update = useUpdateStudentProfile();
  const submitProfile = useSubmitProfile();
  const { data: changeRequests } = useProfileChangeRequests();
  const createChangeRequest = useCreateChangeRequest();

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: emptyProfileFormValues(),
  });

  useEffect(() => {
    if (!data) return;
    reset(profileToFormValues(data));
  }, [data, reset]);

  const isLocked = !!data?.profileSubmittedAt;

  const onSave = handleSubmit((values) => {
    update.mutate({
      fullName: values.fullName?.trim() ?? "",
      contactPhone: values.contactPhone?.trim() ?? "",
      careerGoal: values.careerGoal?.trim() ?? "",
      targetCountries: parseTargetCountries(values.targetCountries),
      targetIntake: values.targetIntake?.trim() ?? "",
      ...(isLocked ? {} : { applicationProfile: formValuesToApplicationProfile(values) }),
    });
  });

  const onRequestChange = (section: string, message: string) => {
    createChangeRequest.mutate({ section, message });
  };

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {() => (
        <form onSubmit={onSave} className="space-y-6">
          {isLocked ? (
            <Card>
              <CardBody className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-700">
                  Your profile has been submitted and is now read-only. Use "Request changes" within a section if
                  something needs to be corrected.
                </p>
                <Badge variant="green">Submitted</Badge>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardBody className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Goals & plans</h3>
              <div>
                <Label htmlFor="careerGoal">Career goal</Label>
                <Textarea
                  id="careerGoal"
                  rows={3}
                  className="mt-1"
                  placeholder="e.g. Mechatronics & Automation Engineer"
                  error={!!errors.careerGoal}
                  {...register("careerGoal")}
                />
                {errors.careerGoal && <p className="mt-1 text-xs text-flag-red-solid">{errors.careerGoal.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="targetCountries">Target countries</Label>
                  <Input
                    id="targetCountries"
                    className="mt-1"
                    placeholder="e.g. DE, NL, CA"
                    error={!!errors.targetCountries}
                    {...register("targetCountries")}
                  />
                  <p className="mt-1 text-xs text-gray-500">Up to 3 two-letter country codes, comma-separated.</p>
                  {errors.targetCountries && (
                    <p className="mt-1 text-xs text-flag-red-solid">{errors.targetCountries.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="targetIntake">Target intake</Label>
                  <Input
                    id="targetIntake"
                    className="mt-1"
                    placeholder="e.g. September 2027"
                    error={!!errors.targetIntake}
                    {...register("targetIntake")}
                  />
                  {errors.targetIntake && <p className="mt-1 text-xs text-flag-red-solid">{errors.targetIntake.message}</p>}
                </div>
              </div>
            </CardBody>
          </Card>

          <ProfileStepper
            control={control}
            register={register}
            getValues={getValues}
            setValue={setValue}
            disabled={isLocked}
            changeRequests={changeRequests ?? []}
            onRequestChange={onRequestChange}
            isRequestingChange={createChangeRequest.isPending}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" loading={update.isPending}>
              Save profile
            </Button>
            {!isLocked && (
              <Button
                type="button"
                variant="secondary"
                loading={submitProfile.isPending}
                onClick={() => submitProfile.mutate()}
              >
                Submit profile
              </Button>
            )}
            {update.isSuccess && <span className="text-sm text-flag-green-text">Saved</span>}
            {update.isError && <span className="text-sm text-flag-red-solid">Couldn't save. Please try again.</span>}
            {createChangeRequest.isSuccess && (
              <span className="text-sm text-flag-green-text">Change request sent</span>
            )}
          </div>
        </form>
      )}
    </AsyncBoundary>
  );
}
