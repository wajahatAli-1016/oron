import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { Button } from '../UI';

export type RefreshButtonProps = {
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  text?: string;
};

export const RefreshButton = ({
  onRefresh,
  isLoading = false,
  variant = 'secondary',
  size = 'md',
  className = '',
  showText = true,
  text = 'Refresh',
}: RefreshButtonProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const isRefreshing = refreshing || isLoading;

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      isLoading={isRefreshing}
      variant={variant}
      size={size}
      icon={RefreshCw}
      className={className}
      type="button"
    >
      {showText ? (isRefreshing ? 'Refreshing...' : text) : null}
    </Button>
  );
};

