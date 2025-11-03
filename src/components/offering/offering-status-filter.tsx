'use client';

import type { OfferingStatus } from '@/lib/mock-offering';

const STATUSES: Array<{ value: OfferingStatus; label: string }> = [
  { value: 'UPCOMING', label: '시작 전' },
  { value: 'ONGOING', label: '진행 중' },
  { value: 'ENDED', label: '종료' },
];

interface OfferingStatusFilterProps {
  selected: OfferingStatus[];
  onChange: (next: OfferingStatus[]) => void;
}

export function OfferingStatusFilter({
  selected,
  onChange,
}: OfferingStatusFilterProps) {
  const handleToggle = (status: OfferingStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === STATUSES.length) {
      onChange([]);
    } else {
      onChange(STATUSES.map((s) => s.value));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-900">공모 상태</h3>

      <div className="flex flex-col gap-3">
        {STATUSES.map((status) => (
          <label
            key={status.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(status.value)}
              onChange={() => handleToggle(status.value)}
              className="w-4 h-4 rounded border-gray-300 accent-black"
            />
            <span className="text-sm text-gray-700">{status.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
