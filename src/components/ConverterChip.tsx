import { useRunway } from '../hooks/useRunway';

export function ConverterChip() {
  const { data, isLoading } = useRunway();

  if (isLoading || !data || data.minutes_per_penny === null) {
    return null;
  }

  const minutesPerPound = data.minutes_per_penny * 100;
  const hoursPerPound = minutesPerPound / 60;

  let displayText = '';
  if (hoursPerPound >= 1) {
    displayText = `£1 saved ⇒ +${hoursPerPound.toFixed(2)} hours`;
  } else {
    displayText = `£1 saved ⇒ +${minutesPerPound.toFixed(1)} minutes`;
  }

  return (
    <div className="bg-gray-700 text-white text-sm p-2 rounded-full inline-block mt-4">
      {displayText}
    </div>
  );
}
