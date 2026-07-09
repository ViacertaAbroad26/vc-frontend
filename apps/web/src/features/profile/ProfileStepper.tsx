import type { ProfileChangeRequest } from "@viacerta/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@viacerta/ui";
import { Award, Briefcase, GraduationCap, User } from "lucide-react";
import type { Control, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { ChangeRequestPanel } from "./ChangeRequestPanel";
import type { ProfileFormValues } from "./profile-schema";
import { AcademicQualificationSection } from "./sections/AcademicQualificationSection";
import { AddressSection } from "./sections/AddressSection";
import { BackgroundSection } from "./sections/BackgroundSection";
import { EmergencyContactSection } from "./sections/EmergencyContactSection";
import { NationalitySection } from "./sections/NationalitySection";
import { PassportSection } from "./sections/PassportSection";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { TestScoresSection } from "./sections/TestScoresSection";
import { WorkExperienceSection } from "./sections/WorkExperienceSection";

export const PROFILE_SECTIONS = {
  PERSONAL_INFORMATION: "personal_information",
  ACADEMIC_QUALIFICATION: "academic_qualification",
  TEST_SCORES: "test_scores",
  WORK_EXPERIENCE: "work_experience",
} as const;

export function ProfileStepper({
  control,
  register,
  getValues,
  setValue,
  disabled,
  changeRequests,
  onRequestChange,
  isRequestingChange = false,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  getValues: UseFormGetValues<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  disabled: boolean;
  changeRequests: ProfileChangeRequest[];
  onRequestChange: (section: string, message: string) => void;
  isRequestingChange?: boolean;
}) {
  const requestsFor = (section: string) => changeRequests.filter((r) => r.section === section);

  return (
    <Tabs defaultValue="personal">
      <TabsList className="flex-wrap">
        <TabsTrigger value="personal">
          <User className="mr-2 h-4 w-4" />
          Personal information
        </TabsTrigger>
        <TabsTrigger value="academic">
          <GraduationCap className="mr-2 h-4 w-4" />
          Academic qualification
        </TabsTrigger>
        <TabsTrigger value="tests">
          <Award className="mr-2 h-4 w-4" />
          Test scores
        </TabsTrigger>
        <TabsTrigger value="work">
          <Briefcase className="mr-2 h-4 w-4" />
          Work experience
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-4">
        <PersonalInfoSection control={control} register={register} disabled={disabled} />
        <AddressSection control={control} register={register} prefix="mailingAddress" title="Mailing address" disabled={disabled} />
        <AddressSection
          control={control}
          register={register}
          prefix="permanentAddress"
          title="Permanent address"
          disabled={disabled}
          copyFromMailing
          getValues={getValues}
          setValue={setValue}
        />
        <PassportSection control={control} register={register} disabled={disabled} />
        <NationalitySection control={control} disabled={disabled} />
        <BackgroundSection control={control} disabled={disabled} />
        <EmergencyContactSection register={register} disabled={disabled} />
        {disabled && (
          <ChangeRequestPanel
            section={PROFILE_SECTIONS.PERSONAL_INFORMATION}
            requests={requestsFor(PROFILE_SECTIONS.PERSONAL_INFORMATION)}
            onSubmit={(message) => onRequestChange(PROFILE_SECTIONS.PERSONAL_INFORMATION, message)}
            isSubmitting={isRequestingChange}
          />
        )}
      </TabsContent>

      <TabsContent value="academic" className="space-y-4">
        <AcademicQualificationSection control={control} register={register} disabled={disabled} />
        {disabled && (
          <ChangeRequestPanel
            section={PROFILE_SECTIONS.ACADEMIC_QUALIFICATION}
            requests={requestsFor(PROFILE_SECTIONS.ACADEMIC_QUALIFICATION)}
            onSubmit={(message) => onRequestChange(PROFILE_SECTIONS.ACADEMIC_QUALIFICATION, message)}
            isSubmitting={isRequestingChange}
          />
        )}
      </TabsContent>

      <TabsContent value="tests" className="space-y-4">
        <TestScoresSection control={control} register={register} disabled={disabled} />
        {disabled && (
          <ChangeRequestPanel
            section={PROFILE_SECTIONS.TEST_SCORES}
            requests={requestsFor(PROFILE_SECTIONS.TEST_SCORES)}
            onSubmit={(message) => onRequestChange(PROFILE_SECTIONS.TEST_SCORES, message)}
            isSubmitting={isRequestingChange}
          />
        )}
      </TabsContent>

      <TabsContent value="work" className="space-y-4">
        <WorkExperienceSection control={control} register={register} disabled={disabled} />
        {disabled && (
          <ChangeRequestPanel
            section={PROFILE_SECTIONS.WORK_EXPERIENCE}
            requests={requestsFor(PROFILE_SECTIONS.WORK_EXPERIENCE)}
            onSubmit={(message) => onRequestChange(PROFILE_SECTIONS.WORK_EXPERIENCE, message)}
            isSubmitting={isRequestingChange}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
