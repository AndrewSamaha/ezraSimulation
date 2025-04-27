'use client';

import { useSimulation } from '@/context/SimulationContext';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export function SaveStatus() {
  const { state, dispatch } = useSimulation();
  const { currentStep, lastSavedStep, isSaving, saveQueue } = state;
  
  // Calculate number of unsaved steps
  const unsavedStepCount = currentStep - lastSavedStep;
  
  // Determine save status message
  const getSaveStatusMessage = () => {
    if (isSaving) {
      return 'Saving...';
    } 
    
    if (unsavedStepCount <= 0) {
      return 'All changes saved';
    }
    
    return `${unsavedStepCount} step${unsavedStepCount !== 1 ? 's' : ''} not saved`;
  };
  
  // Handle manual save request
  const handleSaveNow = () => {
    dispatch({ type: 'TRIGGER_SAVE_NOW' });
  };
  
  // Determine status color
  const getStatusColor = () => {
    if (isSaving) return 'text-blue-500';
    if (unsavedStepCount > 0) return 'text-amber-500';
    return 'text-green-500';
  };
  
  return (
    <div className="flex items-center gap-2 bg-black/70 p-2 px-3 rounded text-sm">
      <div className={`flex items-center gap-2 ${getStatusColor()}`}>
        {isSaving && <Spinner size="sm" className="h-3 w-3" />}
        <span>{getSaveStatusMessage()}</span>
      </div>
      
      {unsavedStepCount > 0 && !isSaving && (
        <Button 
          onClick={handleSaveNow} 
          size="sm"
          variant="outline"
          className="h-6 py-0 px-2 bg-white/20 text-white border border-white/30 hover:bg-white/30"
        >
          <Save className="h-3 w-3 mr-1" />
          Save now
        </Button>
      )}
    </div>
  );
}
