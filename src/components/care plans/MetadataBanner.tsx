import { CarePlan } from '../../types';
import { Badge, Button } from '../UI';
import { Edit2, Trash2 } from 'lucide-react';

export const MetadataBanner = ({
  carePlan,
  canManage,
  onEdit,
  onDelete,
  onAcknowledge,
  isMutating,
}: {
  carePlan: CarePlan;
  canManage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAcknowledge?: () => void;
  isMutating?: boolean;
}) => {
    if (!carePlan) return null;
    
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Version</p>
            <p className="text-sm font-semibold text-slate-900">v{carePlan.version || '1.0'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Last Review</p>
            <p className="text-sm text-slate-700">
              {carePlan.lastReviewDate ? new Date(carePlan.lastReviewDate).toLocaleDateString() : 'Not reviewed'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Next Review</p>
            <p className="text-sm text-slate-700">
              {carePlan.nextReviewDate ? new Date(carePlan.nextReviewDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Author</p>
            <p className="text-sm text-slate-700">{carePlan.author}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-slate-100 pt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Electronic signature status:</span>
            <Badge variant={carePlan.signed ? 'success' : 'warning'} className="px-2 py-0.5 text-xs">
              {carePlan.signed ? 'Signed' : 'Pending acknowledgment'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {canManage && onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={onEdit}
                disabled={isMutating}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
            {canManage && onDelete && (
              <Button
                size="sm"
                variant="danger"
                className="h-7 text-xs"
                onClick={onDelete}
                disabled={isMutating}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            )}
            {canManage && !carePlan.signed && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={onAcknowledge}
                disabled={isMutating}
              >
                Acknowledge & Sign
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };