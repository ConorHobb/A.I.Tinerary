
import type { ItineraryDay, Activity } from './types';

function parseValue(text: string, key: string): string {
    if (!text) return '';
    const regex = new RegExp(`^\\s*-\\s*\\*\\*${key.replace(/ /g, '\\s')}:\\*\\*\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : '';
}


function parseCost(costString: string): number {
  if (!costString) return 0;
  const match = costString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
}

function parseCoordinates(coordString: string): { lat: number; lng: number } {
  if (!coordString) return { lat: 0, lng: 0 };
  const parts = coordString.split(',').map(s => s.trim());
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return { lat: 0, lng: 0 };
}


export function parseItineraryMarkdown(markdown: string): ItineraryDay[] {
  if (!markdown) {
    return [];
  }
  const days: ItineraryDay[] = [];
  const daySections = markdown.split(/##\s+/).filter(s => s.trim());

  for (const section of daySections) {
    const lines = section.trim().split('\n');
    const dayTitleMatch = lines[0].match(/Day\s+(\d+):\s+(.*)/);
    if (!dayTitleMatch) continue;

    const dayNumber = parseInt(dayTitleMatch[1], 10);
    const dayTitle = dayTitleMatch[2].trim();

    const activities: Activity[] = [];
    let currentActivity: Partial<Activity> | null = null;

    for (const line of lines.slice(1)) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const newActivityMatch = trimmedLine.match(/^- \*\*(.*?):\*\* \((.*?)\) - (.*)/);

      if (newActivityMatch) {
        if (currentActivity) {
          activities.push(currentActivity as Activity);
        }
        
        currentActivity = {
          name: newActivityMatch[1].trim(),
          category: newActivityMatch[2].trim(),
          description: newActivityMatch[3].trim(),
          cost: 0,
          openingHours: '',
          distance: '',
          rationale: '',
          bookingUrl: undefined,
          lat: 0,
          lng: 0,
          mapPin: ''
        };
      } else if (currentActivity) {
        const costMatch = parseValue(line, 'Cost');
        if (costMatch) {
          currentActivity.cost = parseCost(costMatch);
          continue;
        }

        const hoursMatch = parseValue(line, 'Opening Hours');
        if (hoursMatch) {
          currentActivity.openingHours = hoursMatch;
          continue;
        }

        const distanceMatch = parseValue(line, 'Distance');
        if (distanceMatch) {
          currentActivity.distance = distanceMatch;
          continue;
        }
        
        const coordMatch = parseValue(line, 'Coordinates');
        if (coordMatch) {
          const { lat, lng } = parseCoordinates(coordMatch);
          currentActivity.lat = lat;
          currentActivity.lng = lng;
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
