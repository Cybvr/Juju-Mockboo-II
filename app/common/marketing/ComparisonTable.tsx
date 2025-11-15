import { competitors, getAllFeatures, getCompetitors } from '@/data/compareData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, Star } from 'lucide-react';

export default function ComparisonTable() {
  const features = getAllFeatures();
  const competitorList = getCompetitors();
  const juju = competitors.juju;

  const renderFeatureValue = (
    value: { available: boolean; details?: string } | boolean
  ) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-red-500" />
      );
    }
    return value.available ? (
      <div className="flex items-center gap-1">
        <Check className="h-5 w-5 text-green-500" />
        {value.details && <span className="text-xs text-muted-foreground">{value.details}</span>}
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <X className="h-5 w-5 text-red-500" />
        {value.details && <span className="text-xs text-muted-foreground">{value.details}</span>}
      </div>
    );
  };

  const getFeatureValue = (
    competitor: typeof competitors[keyof typeof competitors],
    feature: string
  ) => {
    return competitor.features[feature] ?? false;
  };

  return (
    <div>
      <div className="flex mb-6 text-md">
        <h1>Complete Feature Comparison</h1>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] font-medium">Feature</TableHead>
              <TableHead className="text-left bg-accent font-medium">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  {juju.name}
                </div>
              </TableHead>
              {Object.entries(competitorList).map(([key, competitor]) => (
                <TableHead key={key} className="text-left font-medium">
                  {competitor.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{feature}</TableCell>
                <TableCell className="bg-accent">
                  {renderFeatureValue(getFeatureValue(juju, feature))}
                </TableCell>
                {Object.entries(competitorList).map(([key, competitor]) => (
                  <TableCell key={key}>
                    {renderFeatureValue(getFeatureValue(competitor, feature))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
