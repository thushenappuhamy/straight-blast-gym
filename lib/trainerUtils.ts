import { Trainer } from '@/models/Trainer';

/**
 * Calculate if trainer is currently active based on their shift
 */
export function isTrainerCurrentlyActive(trainer: any): boolean {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

  // Check if today is in shift days
  if (!trainer.shiftDays?.includes(dayName)) {
    return false;
  }

  // Check if current time is within shift
  const shiftStart = trainer.shiftStartTime || '06:00';
  const shiftEnd = trainer.shiftEndTime || '22:00';

  return currentTime >= shiftStart && currentTime < shiftEnd;
}

/**
 * Update all trainers' active status based on current shift
 */
export async function updateAllTrainersStatus() {
  try {
    const trainers = await Trainer.find({});
    
    for (const trainer of trainers) {
      const isActive = isTrainerCurrentlyActive(trainer);
      if (trainer.currentlyActive !== isActive) {
        trainer.currentlyActive = isActive;
        trainer.lastStatusUpdate = new Date();
        await trainer.save();
      }
    }
    
    console.log('✅ [TRAINER STATUS] Updated all trainers status');
  } catch (error) {
    console.error('❌ [TRAINER STATUS] Error updating trainers:', error);
  }
}

/**
 * Format time string from HH:mm to readable format
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return 'N/A';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}

/**
 * Get trainer's current status badge
 */
export function getTrainerStatusDisplay(trainer: any) {
  if (trainer.status === 'on-leave') {
    return { label: 'On Leave', color: 'bg-orange-600 text-white' };
  }
  if (trainer.currentlyActive) {
    return { label: 'Active Now', color: 'bg-green-600 text-white' };
  }
  return { label: 'Inactive', color: 'bg-red-600 text-white' };
}
