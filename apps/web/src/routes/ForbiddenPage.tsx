import { Button } from "@viacerta/ui";
import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Access denied</h1>
      <p className="max-w-md text-gray-600">
        You don&apos;t have permission to view this page.
      </p>
      <Button asChild variant="primary">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
