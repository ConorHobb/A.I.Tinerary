'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Clock, Pin, BookOpen, RefreshCw, Loader2 } from 'lucide-react';
import type { Activity, FullItinerary } from '@/lib/types';
import { getCategoryIcon } from './icons';
import { regenerateActivityAction } from '@/lib/actions';

interface ActivityCardProps {
  activity: Activity;
  dayIndex: number;
  activityIndex: number;
  itinerary: FullItinerary;
  setItinerary: React.Dispatch<React.SetStateAction<FullItinerary | null>>;
}

export default function ActivityCard({
  activity,
  dayIndex,
  activityIndex,
  itinerary,
  setItinerary,
}: ActivityCardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [constraints, setConstraints] = React.useState('');
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const CategoryIcon = getCategoryIcon(activity.category);
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const regeneratedActivity = await regenerateActivityAction({
        itinerary: JSON.stringify(itinerary),
        dayIndex,
        activityIndex,
        constraints,
      });

      if (regeneratedActivity) {
        setItinerary((prevItinerary) => {
          if (!prevItinerary) return null;
          const newItinerary = { ...prevItinerary };
          const newDays = [...newItinerary.days];
          const newDay = { ...newDays[dayIndex] };
          const newActivities = [...newDay.activities];
          newActivities[activityIndex] = regeneratedActivity;
          newDay.activities = newActivities;
          newDays[dayIndex] = newDay;
          newItinerary.days = newDays;
          return newItinerary;
        });
        setIsDialogOpen(false);
      } else {
        throw new Error('Failed to get a valid response from the AI.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <>
      <Card className="bg-white/50 border-primary/20 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              <CategoryIcon className="h-4 w-4 mr-2" />
              {activity.category}
            </Badge>
            <CardTitle className="font-headline text-xl">{activity.name}</CardTitle>
            <CardDescription>{activity.description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Swap
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>Cost: ${activity.cost}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{activity.openingHours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-primary" />
              <span>{activity.distance}</span>
            </div>
          </div>
          {activity.rationale && (
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <p className="text-sm text-primary/80">
                    <span className="font-bold">Why this fits your trip:</span> {activity.rationale}
                </p>
            </div>
          )}
          {activity.bookingUrl && (
             <div className="mt-4">
                <Button asChild variant="link" className="p-0 h-auto">
                    <a href={activity.bookingUrl} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-4 w-4 mr-2"/>
                        Book or learn more
                    </a>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Swap Activity: {activity.name}</DialogTitle>
            <DialogDescription>
              Tell us what you'd like to change. For example, "find a cheaper restaurant", "something more kid-friendly", or "an outdoor activity instead".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="constraints" className="text-right">
                I'd like...
              </Label>
              <Textarea
                id="constraints"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="col-span-3"
                placeholder="e.g., something less touristy"
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRegenerate} disabled={isRegenerating || !constraints}>
              {isRegenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...</>
              ) : (
                'Regenerate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
