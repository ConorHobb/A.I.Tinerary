
import type { ItineraryDay, Activity } from './types';

function parseValue(text: string, key: string): string {
    if (!text) return '';
    // This regex looks for a key like **Cost:** and captures the value after it until the end of the line.
    const regex = new RegExp(`\\*\\*${key}:\\*\\*\\s*([^\\n\\r]*)`);
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
    
    // Split the day's content into blocks for each activity.
    // An activity starts with a line like "- **Activity Name]:** (Category) - Description"
    // and we split by that pattern.
    const activityTextBlocks = section.split(/^\s*-\s*\*\*(?![A-Za-z\s]+:)/m).filter(s => s.trim());
    
    // The first item after split is usually the day title, so we find the first real activity
    const firstActivityIndex = activityTextBlocks.findIndex(block => !block.match(/Day\s+(\d+):/));
    if (firstActivityIndex === -1) continue;


    for (let i = firstActivityIndex; i < activityTextBlocks.length; i++) {
        const block = activityTextBlocks[i];
        const fullActivityText = `- **${block}`;
      
        const activityLines = block.trim().split('\n');
      
        const firstLine = activityLines[0];

        // Extracts: "Activity Name]:** (Category) - Description"
        const nameMatch = firstLine.match(/^(.*?):/);
        if (!nameMatch) continue;
        
        const name = nameMatch[1].replace(/\]:\*\*$/, '').trim(); // Clean up the name
        
        const categoryMatch = firstLine.match(/\((.*?)\)/);
        const category = categoryMatch && categoryMatch[1] ? categoryMatch[1].trim() : 'Activity';
        
        const descriptionMatch = firstLine.match(/\)\s*-\s*(.*)/);
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
