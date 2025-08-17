
import type { ItineraryDay, Activity } from './types';

function parseValue(text: string, key: string): string {
    if (!text) return '';
    // This regex looks for a key like **Cost:** or **Opening Hours:** and captures the value after it until the end of the line.
    // It's designed to work on a single line.
    const regex = new RegExp(`^\\s*-\\s*\\*\\*${key}:\\*\\*\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : '';
}

function parseCost(costString: string): number {
  if (!costString) return 0;
  // This regex finds the first number (integer or float) in the string.
  const match = costString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
}


export function parseItineraryMarkdown(markdown: string): ItineraryDay[] {
  if (!markdown) {
    return [];
  }
  const days: ItineraryDay[] = [];
  // Split the markdown by day headers (## Day X: ...)
  const daySections = markdown.split(/##\s+/).filter(s => s.trim());

  for (const section of daySections) {
    const lines = section.trim().split('\n');
    const dayTitleMatch = lines[0].match(/Day\s+(\d+):\s+(.*)/);
    if (!dayTitleMatch) continue;

    const dayNumber = parseInt(dayTitleMatch[1], 10);
    const dayTitle = dayTitleMatch[2].trim();

    const activities: Activity[] = [];
    let currentActivity: Partial<Activity> | null = null;

    for (const line of lines.slice(1)) { // Start from the line after the day title
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check if the line starts a new activity block
      // e.g., "- **Louvre Museum:** (Museum) - ..."
      const newActivityMatch = trimmedLine.match(/^- \*\*(.*?):\*\* \((.*?)\) - (.*)/);

      if (newActivityMatch) {
        // If there was a previous activity, push it to the list
        if (currentActivity) {
          activities.push(currentActivity as Activity);
        }
        
        // Start a new activity
        currentActivity = {
          name: newActivityMatch[1].trim(),
          category: newActivityMatch[2].trim(),
          description: newActivityMatch[3].trim(),
          cost: 0,
          openingHours: '',
          distance: '',
          mapPin: '',
          rationale: '',
          bookingUrl: undefined,
        };
      } else if (currentActivity) {
        // This is a detail line for the current activity
        const costMatch = parseValue(line, 'Cost');
        if (costMatch) {
          currentActivity.cost = parseCost(costMatch);
          continue;
        }

        const hoursMatch = parseValue(line, 'Opening Hours|Hours');
        if (hoursMatch) {
          currentActivity.openingHours = hoursMatch;
          continue;
        }

        const distanceMatch = parseValue(line, 'Distance');
        if (distanceMatch) {
          currentActivity.distance = distanceMatch;
          continue;
        }

        const rationaleMatch = parseValue(line, 'Rationale');
        if (rationaleMatch) {
          currentActivity.rationale = rationaleMatch;
          continue;
        }

        const bookingUrlMatch = parseValue(line, 'Booking URL');
        if (bookingUrlMatch) {
          currentActivity.bookingUrl = bookingUrlMatch;
          continue;
        }
      }
    }

    // Add the last activity from the loop
    if (currentActivity) {
      activities.push(currentActivity as Activity);
    }
    
    if (activities.length > 0) {
      days.push({
        day: dayNumber,
        title: dayTitle,
        activities,
      });
    }
  }

  return days;
}