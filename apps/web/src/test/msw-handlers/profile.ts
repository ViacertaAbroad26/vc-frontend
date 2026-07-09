import type { ApplicationProfile, ProfileChangeRequest } from "@viacerta/api-client";
import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

const applicationProfile: ApplicationProfile = {
  personalInfo: { dateOfBirth: "2002-05-14", gender: "FEMALE", maritalStatus: "SINGLE" },
  mailingAddress: {
    addressLine1: "221B Baker Street",
    addressLine2: null,
    country: "GB",
    city: "London",
    state: "",
    pincode: "NW1 6XE",
  },
  permanentAddress: {
    addressLine1: "12 MG Road",
    addressLine2: null,
    country: "IN",
    city: "Bengaluru",
    state: "IN-KA",
    pincode: "560001",
  },
  passport: {
    passportNumber: "W6352777",
    issueDate: "2020-01-10",
    expiryDate: "2030-01-09",
    issueCountry: "IN",
    cityOfBirth: "Bengaluru",
    countryOfBirth: "IN",
  },
  nationality: {
    nationality: "IN",
    citizenship: "IN",
    hasMultipleCitizenship: false,
    livingInOtherCountry: false,
  },
  background: {
    appliedForImmigration: false,
    hasMedicalCondition: false,
    hasVisaRefusal: false,
    hasCriminalOffence: false,
  },
  emergencyContact: { name: "Priya Student", phone: "+91-9876500000" },
  educationSummary: { countryOfEducation: "IN", highestLevelOfEducation: "UNDERGRADUATE" },
  educationRecords: [
    {
      levelOfStudy: "UNDERGRADUATE",
      countryOfStudy: "IN",
      stateOfStudy: "",
      cityOfStudy: "Bhubaneswar",
      university: "KIIT",
      board: "",
      institutionName: "",
      qualification: "B.Tech",
      gradingSystem: "CGPA",
      marksScored: "8.5",
      primaryLanguage: "English",
      backlogs: 0,
      startDate: "2021-08-01",
      endDate: "2025-06-30",
    },
  ],
  testScores: [
    {
      category: "APTITUDE",
      testType: "GRE",
      overallScore: "320",
      dateOfExamination: "2025-09-01",
      registrationNumber: "GRE-12345",
      quantitative: "161",
      verbal: "159",
      analyticalWriting: "4.0",
      reading: "",
      listening: "",
      writing: "",
      speaking: "",
    },
  ],
  workExperience: [
    {
      designation: "SDE Intern",
      company: "Foreign Admits",
      fromDate: "2024-05-01",
      toDate: "2024-07-31",
      isCurrent: false,
    },
  ],
};

const profile: {
  fullName: string | null;
  persona: string;
  profileData: Record<string, unknown>;
  careerGoal: string;
  targetCountries: string[];
  targetIntake: string;
  contactPhone: string | null;
  address: string | null;
  applicationProfile: ApplicationProfile;
  profileSubmittedAt: string | null;
} = {
  fullName: "Alex Student",
  persona: "FINAL_YEAR_UG",
  profileData: { degree: "B.Tech", branch: "Mechatronics" },
  careerGoal: "Mechatronics & Automation Engineer",
  targetCountries: ["DE", "NL"],
  targetIntake: "September 2027",
  contactPhone: null,
  address: null,
  applicationProfile,
  profileSubmittedAt: null,
};

const changeRequests: ProfileChangeRequest[] = [];
let changeRequestCounter = 0;

export const profileHandlers = [
  http.get(`${API}/portal/students/me/profile`, () => HttpResponse.json(profile)),
  http.patch(`${API}/portal/students/me/profile`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.fullName !== undefined) profile.fullName = body.fullName as string | null;
    if (body.profileData) {
      profile.profileData = { ...profile.profileData, ...(body.profileData as Record<string, unknown>) };
    }
    if (body.careerGoal !== undefined) profile.careerGoal = body.careerGoal as string;
    if (body.targetCountries !== undefined) profile.targetCountries = body.targetCountries as string[];
    if (body.targetIntake !== undefined) profile.targetIntake = body.targetIntake as string;
    if (body.contactPhone !== undefined) profile.contactPhone = body.contactPhone as string | null;
    if (body.address !== undefined) profile.address = body.address as string | null;
    if (body.applicationProfile !== undefined) {
      if (profile.profileSubmittedAt) {
        return HttpResponse.json(
          {
            type: "https://viacerta.dev/errors/profile-locked",
            title: "Profile is locked",
            status: 409,
            detail: "Profile is locked. Submit a change request to update it.",
          },
          { status: 409 },
        );
      }
      profile.applicationProfile = body.applicationProfile as ApplicationProfile;
    }
    return HttpResponse.json(profile);
  }),
  http.post(`${API}/portal/students/me/profile/submit`, () => {
    if (!profile.profileSubmittedAt) {
      profile.profileSubmittedAt = new Date().toISOString();
    }
    return HttpResponse.json(profile);
  }),
  http.get(`${API}/portal/students/me/profile/change-requests`, () => HttpResponse.json(changeRequests)),
  http.post(`${API}/portal/students/me/profile/change-requests`, async ({ request }) => {
    const body = (await request.json()) as { section: string; message: string };
    changeRequestCounter += 1;
    const created: ProfileChangeRequest = {
      id: `cr-${changeRequestCounter}`,
      section: body.section,
      message: body.message,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    changeRequests.unshift(created);
    return HttpResponse.json(created);
  }),
];
