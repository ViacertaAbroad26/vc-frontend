import { useParams } from "react-router-dom";

import { StudentDetail } from "@/features/student-detail/StudentDetail";

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return <StudentDetail studentId={studentId!} />;
}
