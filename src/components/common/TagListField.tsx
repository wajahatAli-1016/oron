import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge, Button } from '../UI';

type TagListFieldProps = {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  badgeVariant?: 'default' | 'danger';
  disabled?: boolean;
};

export const TagListField = ({
  items,
  onChange,
  placeholder,
  badgeVariant = 'default',
  disabled = false,
}: TagListFieldProps) => {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const value = draft.trim();
    if (!value) return;
    if (items.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...items, value]);
    setDraft('');
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <Button type="button" variant="outline" size="sm" icon={Plus} onClick={addItem}>
          Add
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <Badge
              key={`${item}-${index}`}
              variant={badgeVariant}
              className={
                badgeVariant === 'danger'
                  ? 'gap-1 pr-1 bg-red-100 text-red-700 border-red-200'
                  : 'gap-1 pr-1 bg-white text-slate-700 border-slate-200'
              }
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-500"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
