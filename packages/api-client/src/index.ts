import createClient from "openapi-fetch";

import { createAxios } from "./axios-instance";
import type { components, paths } from "./generated/api";

export { authStorage } from "./auth-storage";
export { devOverrideStorage, type DevOverride } from "./dev-override";
export { ApiError } from "./errors";

// We expose two layers:
//   1. apiAxios — raw axios for the rare case we need it (multipart uploads)
//   2. apiClient — openapi-fetch typed client
// Most code uses apiClient. Forms with files use apiAxios.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export { BASE_URL };

export const apiAxios = createAxios({ baseURL: BASE_URL });

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  fetch: async (request) => {
    // route fetch through axios to reuse interceptors
    const resp = await apiAxios.request({
      url: request.url,
      method: request.method,
      data: request.body ? await request.text() : undefined,
      headers: Object.fromEntries(request.headers.entries()),
    });
    return new Response(JSON.stringify(resp.data), {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  },
});

// Re-export the full schema for screens that need it
export type { components as ApiComponents } from "./generated/api";

// Convenience exports of common shapes
export type StudentProfile = components["schemas"]["StudentProfileResponse"];
export type UpdateStudentProfileRequest = components["schemas"]["UpdateStudentProfileRequest"];
export type ConfigurationItem = components["schemas"]["ConfigurationItem"];
export type ConfigurationListResponse = components["schemas"]["ConfigurationListResponse"];
export type ConfigurationType = components["schemas"]["ConfigurationType"];
export type ApplicationProfile = components["schemas"]["ApplicationProfileData"];
export type PersonalInfo = components["schemas"]["PersonalInfo"];
export type AddressInfo = components["schemas"]["AddressInfo"];
export type PassportInfo = components["schemas"]["PassportInfo"];
export type NationalityInfo = components["schemas"]["NationalityInfo"];
export type BackgroundInfo = components["schemas"]["BackgroundInfo"];
export type EmergencyContact = components["schemas"]["EmergencyContact"];
export type EducationSummary = components["schemas"]["EducationSummary"];
export type EducationRecord = components["schemas"]["EducationRecord"];
export type TestScore = components["schemas"]["TestScore"];
export type WorkExperienceEntry = components["schemas"]["WorkExperienceEntry"];
export type ProfileChangeRequest = components["schemas"]["ProfileChangeRequestResponse"];
export type CreateProfileChangeRequestRequest = components["schemas"]["CreateProfileChangeRequestRequest"];
export type ChangeRequestStatus = components["schemas"]["ChangeRequestStatus"];
export type StudentReport = components["schemas"]["StudentReportResponse"];
export type StudentJourney = components["schemas"]["StudentJourneyResponse"];
export type IntakeForm = components["schemas"]["IntakeForm"];
export type IntakeSection = components["schemas"]["IntakeSection"];
export type IntakeQuestion = components["schemas"]["IntakeQuestion"];
export type IntakeStartResponse = components["schemas"]["IntakeStartResponse"];
export type SaveIntakeResponse = components["schemas"]["SaveIntakeResponse"];
export type SubmitIntakeResponse = components["schemas"]["SubmitIntakeResponse"];
export type Persona = components["schemas"]["Persona"];
export type AdvisorAssessment = components["schemas"]["AdvisorAssessmentResponse"];
export type CaseListResponse = components["schemas"]["CaseListResponse"];
export type GcriResults = components["schemas"]["GcriResultsResponse"];
export type AdvisorReport = components["schemas"]["AdvisorReportResponse"];
export type AuthEnvelope = components["schemas"]["AuthEnvelope"];
export type AuthUser = components["schemas"]["UserSummary"];
export type DocumentResponse = components["schemas"]["DocumentResponse"];
export type DocumentListResponse = components["schemas"]["DocumentListResponse"];
export type DocumentType = components["schemas"]["DocumentType"];
export type DocumentStatus = components["schemas"]["DocumentStatus"];
export type EvidenceLevel = components["schemas"]["EvidenceLevel"];
export type DecisionRequest = components["schemas"]["DecisionRequest"];
export type DecisionResponse = components["schemas"]["DecisionResponse"];
export type PresignedUrlResponse = components["schemas"]["PresignedUrlResponse"];
export type LeadListResponse = components["schemas"]["LeadListResponse"];
export type MessageResponse = components["schemas"]["MessageResponse"];
export type DocumentQueueResponse = components["schemas"]["DocumentQueueResponse"];
export type DocumentOpsResponse = components["schemas"]["DocumentOpsResponse"];
export type UserListResponse = components["schemas"]["UserListResponse"];
export type UserItem = components["schemas"]["UserItem"];
export type UserRole = components["schemas"]["UserRole"];
export type CreateUserRequest = components["schemas"]["CreateUserRequest"];
export type ChangeRoleRequest = components["schemas"]["ChangeRoleRequest"];
export type SessionListResponse = components["schemas"]["SessionListResponse"];
export type SessionItem = components["schemas"]["SessionItem"];
export type SessionType = components["schemas"]["SessionType"];
export type AuditLogListResponse = components["schemas"]["AuditLogListResponse"];
export type AuditLogItem = components["schemas"]["AuditLogItem"];
export type AuditAction = components["schemas"]["AuditAction"];
export type AdvanceRequest = components["schemas"]["AdvanceRequest"];
export type StateResponse = components["schemas"]["StateResponse"];
export type JourneyStateCode = components["schemas"]["JourneyStateCode"];
export type CountryMappingResponse = components["schemas"]["CountryMappingResponse"];
export type CountryCandidateItem = components["schemas"]["CountryCandidateItem"];
export type CountryCandidateUpdate = components["schemas"]["CountryCandidateUpdate"];
export type UpdateCountryMappingRequest = components["schemas"]["UpdateCountryMappingRequest"];
export type ConfirmCountryMappingRequest = components["schemas"]["ConfirmCountryMappingRequest"];
export type UniversitySelectionResponse = components["schemas"]["UniversitySelectionResponse"];
export type UniversityCandidateItem = components["schemas"]["UniversityCandidateItem"];
export type UniversityCandidateInput = components["schemas"]["UniversityCandidateInput"];
export type UpdateUniversitySelectionRequest = components["schemas"]["UpdateUniversitySelectionRequest"];
export type ConfirmUniversitySelectionRequest = components["schemas"]["ConfirmUniversitySelectionRequest"];
export type DocumentPrepResponse = components["schemas"]["DocumentPrepResponse"];
export type DocumentPrepItemResponse = components["schemas"]["DocumentPrepItemResponse"];
export type DocumentPrepItemUpdate = components["schemas"]["DocumentPrepItemUpdate"];
export type UpdateDocumentPrepRequest = components["schemas"]["UpdateDocumentPrepRequest"];
export type ConfirmDocumentPrepRequest = components["schemas"]["ConfirmDocumentPrepRequest"];
export type ApplicationTrackerResponse = components["schemas"]["ApplicationTrackerResponse"];
export type ApplicationItemResponse = components["schemas"]["ApplicationItemResponse"];
export type ApplicationItemUpdate = components["schemas"]["ApplicationItemUpdate"];
export type UpdateApplicationTrackerRequest = components["schemas"]["UpdateApplicationTrackerRequest"];
export type ConfirmApplicationTrackerRequest = components["schemas"]["ConfirmApplicationTrackerRequest"];
export type VisaTrackerResponse = components["schemas"]["VisaTrackerResponse"];
export type UpdateVisaTrackerRequest = components["schemas"]["UpdateVisaTrackerRequest"];
export type ConfirmVisaTrackerRequest = components["schemas"]["ConfirmVisaTrackerRequest"];
export type PreDepartureResponse = components["schemas"]["PreDepartureResponse"];
export type PreDepartureItemResponse = components["schemas"]["PreDepartureItemResponse"];
export type PreDepartureItemUpdate = components["schemas"]["PreDepartureItemUpdate"];
export type UpdatePreDepartureRequest = components["schemas"]["UpdatePreDepartureRequest"];
export type ConfirmPreDepartureRequest = components["schemas"]["ConfirmPreDepartureRequest"];
export type PlacementResponse = components["schemas"]["PlacementResponse"];
export type PlacementItemResponse = components["schemas"]["PlacementItemResponse"];
export type PlacementItemUpdate = components["schemas"]["PlacementItemUpdate"];
export type UpdatePlacementRequest = components["schemas"]["UpdatePlacementRequest"];
export type ConfirmPlacementRequest = components["schemas"]["ConfirmPlacementRequest"];
export type DisputeResponse = components["schemas"]["DisputeResponse"];
export type DisputeListResponse = components["schemas"]["DisputeListResponse"];
export type ResolveDisputeRequest = components["schemas"]["ResolveDisputeRequest"];
export type DisputeStatus = components["schemas"]["DisputeStatus"];
export type OpenDisputeRequest = components["schemas"]["OpenDisputeRequest"];
export type CalibrationCaseList = components["schemas"]["CalibrationCaseList"];
export type CalibrationCaseView = components["schemas"]["CalibrationCaseView"];
export type ScoreRequest = components["schemas"]["ScoreRequest"];
export type VarianceResponse = components["schemas"]["VarianceResponse"];
export type CaseVariance = components["schemas"]["CaseVariance"];
export type OutcomeCorrelationResponse = components["schemas"]["OutcomeCorrelationResponse"];
export type SubComponentCorrelation = components["schemas"]["SubComponentCorrelation"];
export type GcriFactorCorrelation = components["schemas"]["GcriFactorCorrelation"];
export type RubricCalibrationDraftResponse = components["schemas"]["RubricCalibrationDraftResponse"];
export type Session1QuestionView = components["schemas"]["Session1QuestionView"];
export type Session1QuestionSequenceResponse = components["schemas"]["Session1QuestionSequenceResponse"];
export type UpdateSession1QuestionsRequest = components["schemas"]["UpdateSession1QuestionsRequest"];
export type OutcomeCoverageResponse = components["schemas"]["OutcomeCoverageResponse"];
export type CohortOutcomeCoverage = components["schemas"]["CohortOutcomeCoverage"];
export type StudentSession1Question = components["schemas"]["StudentSession1Question"];
export type StudentSession1QuestionSequenceResponse = components["schemas"]["StudentSession1QuestionSequenceResponse"];
export type SubmitSession1AnswersRequest = components["schemas"]["SubmitSession1AnswersRequest"];
export type Session1SlotsResponse = components["schemas"]["Session1SlotsResponse"];
export type CreateSession1BookingRequest = components["schemas"]["CreateSession1BookingRequest"];
export type Session1BookingResponse = components["schemas"]["Session1BookingResponse"];
export type NotificationItem = components["schemas"]["NotificationItem"];
export type NotificationListResponse = components["schemas"]["NotificationListResponse"];
export type MarkAllReadResponse = components["schemas"]["MarkAllReadResponse"];
export type NotificationPreferenceItem = components["schemas"]["NotificationPreferenceItem"];
export type NotificationPreferencesResponse = components["schemas"]["NotificationPreferencesResponse"];
export type UpdateNotificationPreferencesRequest = components["schemas"]["UpdateNotificationPreferencesRequest"];
export type OutcomeResponse = components["schemas"]["OutcomeResponse"];
export type OutcomeYear1Request = components["schemas"]["OutcomeYear1Request"];
export type OutcomeYear3Request = components["schemas"]["OutcomeYear3Request"];
export type FreshnessResponse = components["schemas"]["FreshnessResponse"];
export type FreshnessCell = components["schemas"]["FreshnessCell"];
export type HardcodedDowngradeRequest = components["schemas"]["HardcodedDowngradeRequest"];
export type VersionResponse = components["schemas"]["VersionResponse"];
export type CareerVertical = components["schemas"]["CareerVertical"];
export type OrganizationResponse = components["schemas"]["OrganizationResponse"];
export type OrganizationListResponse = components["schemas"]["OrganizationListResponse"];
export type CreateOrganizationRequest = components["schemas"]["CreateOrganizationRequest"];
export type AdminOverviewResponse = components["schemas"]["AdminOverviewResponse"];
export type GcssFlagCounts = components["schemas"]["GcssFlagCounts"];
export type BranchOverview = components["schemas"]["BranchOverview"];
export type StaffRoleCount = components["schemas"]["StaffRoleCount"];
export type ParentSummaryResponse = components["schemas"]["ParentSummaryResponse"];
export type UniversityItem = components["schemas"]["UniversityItem"];
export type UniversityListResponse = components["schemas"]["UniversityListResponse"];
