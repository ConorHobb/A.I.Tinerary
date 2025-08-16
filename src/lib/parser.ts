import type { ItineraryDay, Activity } from './types';

function parseValue(text: string, key: string): string {
  const regex = new RegExp(`\\*\\*${key}:\\*\\*\\s*([^\\*\\*]+)`);
  const match = text.match(regex);
  return match ? match[1].trim() : '';
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
  const daySections = markdown.split(/##\s+/).filter(Boolean);

  for (const section of daySections) {
    const lines = section.trim().split('\n');
    const dayTitleMatch = lines[0].match(/Day\s+(\d+):\s+(.*)/);
    if (!dayTitleMatch) continue;

    const dayNumber = parseInt(dayTitleMatch[1], 10);
    const dayTitle = dayTitleMatch[2].trim();

    const activities: Activity[] = [];
    
    // Combine multi-line activity descriptions
    const activityChunks: string[] = [];
    let currentChunk = '';
    for (const line of lines.slice(1)) {
        if (line.trim().startsWith('- **') && currentChunk) {
            activityChunks.push(currentChunk.trim());
            currentChunk = line;
        } else {
            currentChunk += ` ${line}`;
        }
    }
    if (currentChunk) {
      activityChunks.push(currentChunk.trim());
    }

    for (const chunk of activityChunks) {
      const nameMatch = chunk.match(/- \*\*(.*?):\*\*/);
      const categoryMatch = chunk.match(/\((.*?)\)/);

      if (!nameMatch) continue;

      const name = nameMatch[1].trim();
      const category = categoryMatch ? categoryMatch[1].trim() : 'Activity';
      const descriptionMatch = chunk.match(/\)\s*-\s*([^(\*\*)]+)/);
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';
      
      const costString = parseValue(chunk, 'Cost');
      const cost = parseCost(costString);
      const openingHours = parseValue(chunk, 'Opening Hours|Hours');
      const distance = parseValue(chunk, 'Distance');
      const rationale = parseValue(chunk, 'Rationale');
      const bookingUrl = parseValue(chunk, 'Booking URL');

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
