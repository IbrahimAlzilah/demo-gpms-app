import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWindowCheck } from '../hooks/useTimeWindows';
import { useTranslation } from 'react-i18next';

interface TimeWindowAlertProps {
  windowType: string;
  showWhenClosed?: boolean;
  showWhenOpen?: boolean;
}

export const TimeWindowAlert = ({
  windowType,
  showWhenClosed = true,
  showWhenOpen = true,
}: TimeWindowAlertProps) => {
  const { t } = useTranslation();
  const { data: windowCheck, isLoading } = useWindowCheck(windowType);

  if (isLoading || !windowCheck) {
    return null;
  }

  const { is_active, window, days_remaining } = windowCheck;

  // Show appropriate alert based on window status
  if (!is_active && showWhenClosed) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('timeWindow.closed')}</AlertTitle>
        <AlertDescription>
          {t('timeWindow.closedDescription', {
            type: windowType,
          })}
        </AlertDescription>
      </Alert>
    );
  }

  if (is_active && showWhenOpen) {
    const isEndingSoon = days_remaining !== null && days_remaining <= 3;

    return (
      <Alert
        variant={isEndingSoon ? 'destructive' : 'default'}
        className="mb-4"
      >
        {isEndingSoon ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        <AlertTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {window?.name}
        </AlertTitle>
        <AlertDescription>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            {days_remaining !== null && (
              <span>
                {t('timeWindow.daysRemaining', { count: days_remaining })}
              </span>
            )}
          </div>
          {window?.description && (
            <p className="mt-2 text-sm">{window.description}</p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
