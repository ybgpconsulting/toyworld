import React from 'react';
import { FilterState } from '../../types';
import { Button } from '../ui/Button';
import { AGE_GROUPS } from '../../lib/constants';

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onClose?: () => void;
}

export const FilterPanel = ({ filters, setFilters, onClose }: FilterPanelProps) => {
  const handleAgeChange = (ageId: string) => {
    setFilters(prev => {
      const current = prev.ageGroups || [];
      return {
        ...prev,
        ageGroups: current.includes(ageId)
          ? current.filter(a => a !== ageId)
          : [...current, ageId]
      };
    });
  };

  const handleStockChange = () => {
    setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }));
  };

  const clearAll = () => {
    setFilters({ categories: [], brands: [], ageGroups: [], inStockOnly: false });
    if (onClose) onClose();
  };

  return (
    <div className="w-full flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        
        {/* Price Range */}
        <div>
          <h3 className="font-bold text-[var(--deep-navy)] mb-3">Price Range</h3>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-full p-2 border rounded-lg text-sm"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="Max" 
              className="w-full p-2 border rounded-lg text-sm"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Age Groups */}
        <div>
          <h3 className="font-bold text-[var(--deep-navy)] mb-3">Age</h3>
          <div className="space-y-2">
            {AGE_GROUPS.map(age => (
              <label key={age.id} className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={Boolean(filters.ageGroups?.includes(age.id))}
                  onChange={() => handleAgeChange(age.id)}
                  className="w-4 h-4 text-[var(--brand-orange)] rounded border-gray-300 focus:ring-[var(--brand-orange)]"
                />
                <span className="text-sm text-gray-700">{age.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="font-bold text-[var(--deep-navy)] mb-3">Availability</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filters.inStockOnly}
              onChange={handleStockChange}
              className="w-4 h-4 text-[var(--brand-orange)] rounded border-gray-300 focus:ring-[var(--brand-orange)]"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 border-t flex gap-3 mt-auto">
        <Button variant="outline" fullWidth onClick={clearAll}>
          Reset
        </Button>
        {onClose && (
          <Button fullWidth onClick={onClose}>
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
