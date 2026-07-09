import type { ApplicationProfile, StudentProfile } from "@viacerta/api-client";
import { z } from "zod";

const optionalString = z.string().optional();
const optionalBool = z.boolean().nullable().optional();

const COUNTRY_CODE = /^[A-Za-z]{2}$/;

export const personalInfoSchema = z.object({
  dateOfBirth: optionalString,
  gender: optionalString,
  maritalStatus: optionalString,
});

export const addressSchema = z.object({
  addressLine1: optionalString,
  addressLine2: optionalString,
  country: optionalString,
  city: optionalString,
  state: optionalString,
  pincode: optionalString,
});

export const passportSchema = z.object({
  passportNumber: optionalString,
  issueDate: optionalString,
  expiryDate: optionalString,
  issueCountry: optionalString,
  cityOfBirth: optionalString,
  countryOfBirth: optionalString,
});

export const nationalitySchema = z.object({
  nationality: optionalString,
  citizenship: optionalString,
  hasMultipleCitizenship: optionalBool,
  livingInOtherCountry: optionalBool,
});

export const backgroundSchema = z.object({
  appliedForImmigration: optionalBool,
  hasMedicalCondition: optionalBool,
  hasVisaRefusal: optionalBool,
  hasCriminalOffence: optionalBool,
});

export const emergencyContactSchema = z.object({
  name: optionalString,
  phone: optionalString,
});

export const educationSummarySchema = z.object({
  countryOfEducation: optionalString,
  highestLevelOfEducation: optionalString,
});

export const educationRecordSchema = z.object({
  levelOfStudy: optionalString,
  countryOfStudy: optionalString,
  stateOfStudy: optionalString,
  cityOfStudy: optionalString,
  university: optionalString,
  board: optionalString,
  institutionName: optionalString,
  qualification: optionalString,
  gradingSystem: optionalString,
  marksScored: optionalString,
  primaryLanguage: optionalString,
  backlogs: optionalString,
  startDate: optionalString,
  endDate: optionalString,
});

export const testScoreSchema = z.object({
  category: z.enum(["APTITUDE", "ENGLISH"]),
  testType: z.string().min(1, "Select a test"),
  overallScore: optionalString,
  dateOfExamination: optionalString,
  registrationNumber: optionalString,
  quantitative: optionalString,
  verbal: optionalString,
  analyticalWriting: optionalString,
  reading: optionalString,
  listening: optionalString,
  writing: optionalString,
  speaking: optionalString,
});

export const workExperienceSchema = z.object({
  designation: optionalString,
  company: optionalString,
  fromDate: optionalString,
  toDate: optionalString,
  isCurrent: z.boolean().default(false),
});

export const ProfileSchema = z.object({
  fullName: z.string().max(120, "Keep it under 120 characters.").optional(),
  contactPhone: z.string().max(30, "Keep it under 30 characters.").optional(),
  careerGoal: z.string().max(500, "Keep it under 500 characters.").optional(),
  targetCountries: z.string().refine((value) => {
    const codes = value
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    return codes.length <= 3 && codes.every((c) => COUNTRY_CODE.test(c));
  }, "Enter up to 3 two-letter country codes, separated by commas (e.g. DE, NL, CA)."),
  targetIntake: z.string().max(50, "Keep it under 50 characters.").optional(),
  personalInfo: personalInfoSchema,
  mailingAddress: addressSchema,
  permanentAddress: addressSchema,
  passport: passportSchema,
  nationality: nationalitySchema,
  background: backgroundSchema,
  emergencyContact: emergencyContactSchema,
  educationSummary: educationSummarySchema,
  educationRecords: z.array(educationRecordSchema),
  testScores: z.array(testScoreSchema),
  workExperience: z.array(workExperienceSchema),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;

export function parseTargetCountries(value: string): string[] {
  return value
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

export function emptyProfileFormValues(): ProfileFormValues {
  return {
    fullName: "",
    contactPhone: "",
    careerGoal: "",
    targetCountries: "",
    targetIntake: "",
    personalInfo: { dateOfBirth: "", gender: "", maritalStatus: "" },
    mailingAddress: emptyAddress(),
    permanentAddress: emptyAddress(),
    passport: {
      passportNumber: "",
      issueDate: "",
      expiryDate: "",
      issueCountry: "",
      cityOfBirth: "",
      countryOfBirth: "",
    },
    nationality: {
      nationality: "",
      citizenship: "",
      hasMultipleCitizenship: null,
      livingInOtherCountry: null,
    },
    background: {
      appliedForImmigration: null,
      hasMedicalCondition: null,
      hasVisaRefusal: null,
      hasCriminalOffence: null,
    },
    emergencyContact: { name: "", phone: "" },
    educationSummary: { countryOfEducation: "", highestLevelOfEducation: "" },
    educationRecords: [],
    testScores: [],
    workExperience: [],
  };
}

export const emptyAddress = (): ProfileFormValues["mailingAddress"] => ({
  addressLine1: "",
  addressLine2: "",
  country: "",
  city: "",
  state: "",
  pincode: "",
});

export const emptyEducationRecord = (): ProfileFormValues["educationRecords"][number] => ({
  levelOfStudy: "",
  countryOfStudy: "",
  stateOfStudy: "",
  cityOfStudy: "",
  university: "",
  board: "",
  institutionName: "",
  qualification: "",
  gradingSystem: "",
  marksScored: "",
  primaryLanguage: "",
  backlogs: "",
  startDate: "",
  endDate: "",
});

export const emptyTestScore = (category: "APTITUDE" | "ENGLISH"): ProfileFormValues["testScores"][number] => ({
  category,
  testType: "",
  overallScore: "",
  dateOfExamination: "",
  registrationNumber: "",
  quantitative: "",
  verbal: "",
  analyticalWriting: "",
  reading: "",
  listening: "",
  writing: "",
  speaking: "",
});

export const emptyWorkExperience = (): ProfileFormValues["workExperience"][number] => ({
  designation: "",
  company: "",
  fromDate: "",
  toDate: "",
  isCurrent: false,
});

const s = (value: string | null | undefined): string => value ?? "";

function addressToForm(address: ApplicationProfile["mailingAddress"] | undefined): ProfileFormValues["mailingAddress"] {
  return {
    addressLine1: s(address?.addressLine1),
    addressLine2: s(address?.addressLine2),
    country: s(address?.country),
    city: s(address?.city),
    state: s(address?.state),
    pincode: s(address?.pincode),
  };
}

/** Maps the API response into the form's `defaultValues` shape (all strings, never null). */
export function profileToFormValues(profile: StudentProfile): ProfileFormValues {
  const ap = profile.applicationProfile ?? {};

  return {
    fullName: profile.fullName ?? "",
    contactPhone: profile.contactPhone ?? "",
    careerGoal: profile.careerGoal ?? "",
    targetCountries: (profile.targetCountries ?? []).join(", "),
    targetIntake: profile.targetIntake ?? "",
    personalInfo: {
      dateOfBirth: s(ap.personalInfo?.dateOfBirth),
      gender: s(ap.personalInfo?.gender),
      maritalStatus: s(ap.personalInfo?.maritalStatus),
    },
    mailingAddress: addressToForm(ap.mailingAddress),
    permanentAddress: addressToForm(ap.permanentAddress),
    passport: {
      passportNumber: s(ap.passport?.passportNumber),
      issueDate: s(ap.passport?.issueDate),
      expiryDate: s(ap.passport?.expiryDate),
      issueCountry: s(ap.passport?.issueCountry),
      cityOfBirth: s(ap.passport?.cityOfBirth),
      countryOfBirth: s(ap.passport?.countryOfBirth),
    },
    nationality: {
      nationality: s(ap.nationality?.nationality),
      citizenship: s(ap.nationality?.citizenship),
      hasMultipleCitizenship: ap.nationality?.hasMultipleCitizenship ?? null,
      livingInOtherCountry: ap.nationality?.livingInOtherCountry ?? null,
    },
    background: {
      appliedForImmigration: ap.background?.appliedForImmigration ?? null,
      hasMedicalCondition: ap.background?.hasMedicalCondition ?? null,
      hasVisaRefusal: ap.background?.hasVisaRefusal ?? null,
      hasCriminalOffence: ap.background?.hasCriminalOffence ?? null,
    },
    emergencyContact: {
      name: s(ap.emergencyContact?.name),
      phone: s(ap.emergencyContact?.phone),
    },
    educationSummary: {
      countryOfEducation: s(ap.educationSummary?.countryOfEducation),
      highestLevelOfEducation: s(ap.educationSummary?.highestLevelOfEducation),
    },
    educationRecords: (ap.educationRecords ?? []).map((r) => ({
      levelOfStudy: s(r.levelOfStudy),
      countryOfStudy: s(r.countryOfStudy),
      stateOfStudy: s(r.stateOfStudy),
      cityOfStudy: s(r.cityOfStudy),
      university: s(r.university),
      board: s(r.board),
      institutionName: s(r.institutionName),
      qualification: s(r.qualification),
      gradingSystem: s(r.gradingSystem),
      marksScored: s(r.marksScored),
      primaryLanguage: s(r.primaryLanguage),
      backlogs: r.backlogs === null || r.backlogs === undefined ? "" : String(r.backlogs),
      startDate: s(r.startDate),
      endDate: s(r.endDate),
    })),
    testScores: (ap.testScores ?? []).map((t) => ({
      category: t.category === "ENGLISH" ? "ENGLISH" : "APTITUDE",
      testType: t.testType ?? "",
      overallScore: s(t.overallScore),
      dateOfExamination: s(t.dateOfExamination),
      registrationNumber: s(t.registrationNumber),
      quantitative: s(t.quantitative),
      verbal: s(t.verbal),
      analyticalWriting: s(t.analyticalWriting),
      reading: s(t.reading),
      listening: s(t.listening),
      writing: s(t.writing),
      speaking: s(t.speaking),
    })),
    workExperience: (ap.workExperience ?? []).map((w) => ({
      designation: s(w.designation),
      company: s(w.company),
      fromDate: s(w.fromDate),
      toDate: s(w.toDate),
      isCurrent: w.isCurrent ?? false,
    })),
  };
}

const n = (value: string): string | null => (value.trim() === "" ? null : value.trim());

/** Maps form values back into the `applicationProfile` request shape, dropping empty strings to null. */
export function formValuesToApplicationProfile(values: ProfileFormValues): ApplicationProfile {
  return {
    personalInfo: {
      dateOfBirth: n(values.personalInfo.dateOfBirth ?? ""),
      gender: n(values.personalInfo.gender ?? ""),
      maritalStatus: n(values.personalInfo.maritalStatus ?? ""),
    },
    mailingAddress: {
      addressLine1: n(values.mailingAddress.addressLine1 ?? ""),
      addressLine2: n(values.mailingAddress.addressLine2 ?? ""),
      country: n(values.mailingAddress.country ?? ""),
      city: n(values.mailingAddress.city ?? ""),
      state: n(values.mailingAddress.state ?? ""),
      pincode: n(values.mailingAddress.pincode ?? ""),
    },
    permanentAddress: {
      addressLine1: n(values.permanentAddress.addressLine1 ?? ""),
      addressLine2: n(values.permanentAddress.addressLine2 ?? ""),
      country: n(values.permanentAddress.country ?? ""),
      city: n(values.permanentAddress.city ?? ""),
      state: n(values.permanentAddress.state ?? ""),
      pincode: n(values.permanentAddress.pincode ?? ""),
    },
    passport: {
      passportNumber: n(values.passport.passportNumber ?? ""),
      issueDate: n(values.passport.issueDate ?? ""),
      expiryDate: n(values.passport.expiryDate ?? ""),
      issueCountry: n(values.passport.issueCountry ?? ""),
      cityOfBirth: n(values.passport.cityOfBirth ?? ""),
      countryOfBirth: n(values.passport.countryOfBirth ?? ""),
    },
    nationality: {
      nationality: n(values.nationality.nationality ?? ""),
      citizenship: n(values.nationality.citizenship ?? ""),
      hasMultipleCitizenship: values.nationality.hasMultipleCitizenship ?? null,
      livingInOtherCountry: values.nationality.livingInOtherCountry ?? null,
    },
    background: {
      appliedForImmigration: values.background.appliedForImmigration ?? null,
      hasMedicalCondition: values.background.hasMedicalCondition ?? null,
      hasVisaRefusal: values.background.hasVisaRefusal ?? null,
      hasCriminalOffence: values.background.hasCriminalOffence ?? null,
    },
    emergencyContact: {
      name: n(values.emergencyContact.name ?? ""),
      phone: n(values.emergencyContact.phone ?? ""),
    },
    educationSummary: {
      countryOfEducation: n(values.educationSummary.countryOfEducation ?? ""),
      highestLevelOfEducation: n(values.educationSummary.highestLevelOfEducation ?? ""),
    },
    educationRecords: values.educationRecords.map((r) => ({
      levelOfStudy: n(r.levelOfStudy ?? ""),
      countryOfStudy: n(r.countryOfStudy ?? ""),
      stateOfStudy: n(r.stateOfStudy ?? ""),
      cityOfStudy: n(r.cityOfStudy ?? ""),
      university: n(r.university ?? ""),
      board: n(r.board ?? ""),
      institutionName: n(r.institutionName ?? ""),
      qualification: n(r.qualification ?? ""),
      gradingSystem: n(r.gradingSystem ?? ""),
      marksScored: n(r.marksScored ?? ""),
      primaryLanguage: n(r.primaryLanguage ?? ""),
      backlogs: r.backlogs && r.backlogs.trim() !== "" ? Number(r.backlogs) : null,
      startDate: n(r.startDate ?? ""),
      endDate: n(r.endDate ?? ""),
    })),
    testScores: values.testScores.map((t) => ({
      category: t.category,
      testType: t.testType,
      overallScore: n(t.overallScore ?? ""),
      dateOfExamination: n(t.dateOfExamination ?? ""),
      registrationNumber: n(t.registrationNumber ?? ""),
      quantitative: n(t.quantitative ?? ""),
      verbal: n(t.verbal ?? ""),
      analyticalWriting: n(t.analyticalWriting ?? ""),
      reading: n(t.reading ?? ""),
      listening: n(t.listening ?? ""),
      writing: n(t.writing ?? ""),
      speaking: n(t.speaking ?? ""),
    })),
    workExperience: values.workExperience.map((w) => ({
      designation: n(w.designation ?? ""),
      company: n(w.company ?? ""),
      fromDate: n(w.fromDate ?? ""),
      toDate: w.isCurrent ? null : n(w.toDate ?? ""),
      isCurrent: w.isCurrent,
    })),
  };
}
