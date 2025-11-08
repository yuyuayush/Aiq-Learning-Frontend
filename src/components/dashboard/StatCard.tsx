import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-l font-semibold">{title}</CardTitle>
        
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-light">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground ">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
