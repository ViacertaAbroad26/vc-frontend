import { advisorHandlers } from "./advisor";
import { configurationHandlers } from "./configurations";
import { decisionHandlers } from "./decision";
import { documentHandlers } from "./documents";
import { intakeHandlers } from "./intake";
import { internalHandlers } from "./internal";
import { notificationHandlers } from "./notifications";
import { platformFeatureHandlers } from "./platform-features";
import { profileHandlers } from "./profile";
import { reportHandlers } from "./report";
import { studentHandlers } from "./student";

export const handlers = [
  ...studentHandlers,
  ...intakeHandlers,
  ...documentHandlers,
  ...reportHandlers,
  ...decisionHandlers,
  ...advisorHandlers,
  ...internalHandlers,
  ...notificationHandlers,
  ...platformFeatureHandlers,
  ...profileHandlers,
  ...configurationHandlers,
];
