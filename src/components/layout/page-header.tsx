import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 hidden items-center gap-1 text-sm text-white/40 sm:flex">
          <Link href="/" className="transition-colors hover:text-white/70">
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              <Link
                href={crumb.href}
                className="transition-colors hover:text-white/70"
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-white/50">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
