import { useParams } from "react-router-dom";

import { StudentCaseDocuments } from "@/features/student-detail/documents/StudentCaseDocuments";

export default function StudentDocumentsPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return <StudentCaseDocuments studentId={studentId!} />;
}
