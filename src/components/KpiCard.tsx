import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card role="region" aria-label={label}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export default KpiCard;