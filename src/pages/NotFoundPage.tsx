import { useNavigate } from "react-router-dom";
import { TbHome } from "react-icons/tb";
import { Button } from "@components/ui/common";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 min-h-0 h-full w-full flex items-center justify-center py-8">
      <div className="text-center">
        <div className="mb-6">
          <div className="text-6xl sm:text-7xl font-bold font-mono text-highlight mb-2">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono mb-2">
            Page not found
          </h1>
          <p className="text-foreground/60 text-sm mb-6 max-w-md">
            The page you're looking for doesn't exist. Let's get you back on
            track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2"
          >
            <TbHome size={16} className="text-background" />
            Home
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2"
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
