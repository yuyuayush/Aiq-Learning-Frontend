import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-foreground hover:text-primary transition-colors",
        className
      )}
    >
      <span className="text-xl font-bold font-headline">AIQ Learning</span>
    </Link>
  );
}
