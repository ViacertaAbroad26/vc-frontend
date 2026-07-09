import { useMutation } from "@tanstack/react-query";
import { apiAxios } from "@viacerta/api-client";

export type ReportExportFormat = "pdf" | "docx";

const MIME_TYPES: Record<ReportExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function useExportReport(studentId: string) {
  return useMutation({
    mutationFn: async (format: ReportExportFormat) => {
      const { data } = await apiAxios.get<ArrayBuffer>(
        `/api/v1/advisor/students/${studentId}/report/export/${format}`,
        { responseType: "arraybuffer" },
      );

      const blob = new Blob([data], { type: MIME_TYPES[format] });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${studentId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
}
