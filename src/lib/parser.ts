
import type { ItineraryDay, Activity } from './types';

function parseValue(text: string, key: string): string {
    const regex = new RegExp(`\\*\\*${key}:\\*\\*\\s*([^\\*\\n\\r]*)`);
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : '';
}

function parseCost(costString: string): number {
  if (!costString) return 0;
  const match = costString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
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
    
    const activityChunks = section.split(/-\s+\*\*/).filter(s => s.trim());
    activityChunks.shift(); // Remove the day title part

    for (const chunk of activityChunks) {
      const fullActivityText = `- **${chunk}`;
      
      const nameMatch = chunk.match(/^(.*?):/);
      if (!nameMatch) continue;
      const name = nameMatch[1].trim();
      
      const categoryMatch = chunk.match(/\((.*?)\)/);
      const category = categoryMatch && categoryMatch[1] ? categoryMatch[1].trim() : 'Activity';

      const descriptionMatch = chunk.match(/\)\s*-\s*([^-\n\r]*)/);
      const description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : '';
      
      const costString = parseValue(fullActivityText, 'Cost');
      const cost = parseCost(costString);
      const openingHours = parseValue(fullActivityText, 'Opening Hours|Hours');
      const distance = parseValue(fullActivityText, 'Distance');
      const rationale = parseValue(fullActivityText, 'Rationale');
      const bookingUrl = parseValue(fullActivityText, 'Booking URL');

      activities.push({
        name,
        category,
        description,
        cost,
        openingHours,
        distance,
        mapPin: '', // Not provided by this AI flow
        rationale,
        bookingUrl: bookingUrl || undefined,
      });
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

