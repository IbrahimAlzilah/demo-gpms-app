import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWindowCheck } from '../hooks/useTimeWindows';

interface WindowStatusBadgeProps {
  windowType: string;
  showLabel?: boolean;
}

export const WindowStatusBadge = ({
  windowType,
  showLabel = true,
}: WindowStatusBadgeProps) => {
  const { data: windowCheck, isLoading } = useWindowCheck(windowType);

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        {showLabel && 'جاري التحميل...'}
      </Badge>
    );
  }

  if (!windowCheck) {
    return null;
  }

  const { is_active, days_remaining } = windowCheck;

  if (!is_active) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        {showLabel && 'مغلق'}
      </Badge>
    );
  }

  const isEndingSoon = days_remaining !== null && days_remaining <= 3;

  return (
    <Badge
      variant={isEndingSoon ? 'destructive' : 'default'}
      className="gap-1"
    >
      <CheckCircle className="h-3 w-3" />
      {showLabel && (
        <>
          مفتوح
          {days_remaining !== null && ` (${days_remaining} يوم)`}
        </>
      )}
    </Badge>
  );
};
