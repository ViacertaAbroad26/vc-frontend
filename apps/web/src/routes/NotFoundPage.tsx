import { Button } from "@viacerta/ui";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Page not found</h1>
      <p className="max-w-md text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Button asChild variant="primary">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
