import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const navigate = useNavigate();

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleNavigate("/dashboard")}
        className="flex items-center gap-1 h-auto p-1 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {item.href && !item.current ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate(item.href!)}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Button>
          ) : (
            <span className={item.current ? "text-foreground font-medium" : "text-muted-foreground"}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
