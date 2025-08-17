'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Share2, Save, FileDown, CalendarPlus, Map, Wallet } from 'lucide-react';
import ActivityCard from './activity-card';
import type { FullItinerary } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const TripMapLibre = dynamic(() => import('./trip-map-libre'), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

interface ItineraryDisplayProps {
  itinerary: FullItinerary;
  setItinerary: React.Dispatch<React.SetStateAction<FullItinerary | null>>;
}

export default function ItineraryDisplay({ itinerary, setItinerary }: ItineraryDisplayProps) {
  const [showMap, setShowMap] = React.useState(false);

  const totalCost = React.useMemo(() => {
    return itinerary.days.reduce((total, day) => {
      return total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0);
    }, 0);
  }, [itinerary]);

  const budgetProgress = (totalCost / itinerary.budget) * 100;
  
  const mapActivities = React.useMemo(() => 
    itinerary.days.flatMap(day => day.activities).filter(activity => activity.lat && activity.lng && activity.lat !== 0 && activity.lng !== 0)
  , [itinerary]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h2 className="font-headline text-4xl font-bold">Your Trip to {itinerary.destination}</h2>
          <p className="text-muted-foreground text-lg">{itinerary.length}-day custom itinerary</p>
        </div>
        <Tabs defaultValue="day-1" className="w-full">
          <TabsList className="mb-4 h-auto flex-wrap justify-start">
            {itinerary.days.map((day) => (
              <TabsTrigger key={`trigger-${day.day}`} value={`day-${day.day}`}>
                Day {day.day}
              </TabsTrigger>
            ))}
          </TabsList>
          {itinerary.days.map((day, dayIndex) => (
            <TabsContent key={`content-${day.day}`} value={`day-${day.day}`}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{day.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {day.activities.map((activity, activityIndex) => (
                    <ActivityCard
                      key={`${day.day}-${activityIndex}`}
                      activity={activity}
                      dayIndex={dayIndex}
                      activityIndex={activityIndex}
                      itinerary={itinerary}
                      setItinerary={setItinerary}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="lg:col-span-1 sticky top-24 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><Wallet /> Budget Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>Estimated Cost: ${totalCost.toFixed(2)}</span>
                <span>Budget: ${itinerary.budget.toFixed(2)}</span>
              </div>
              <Progress value={budgetProgress} />
              <p className="text-sm text-muted-foreground">
                {budgetProgress > 100 
                  ? `You are $${(totalCost - itinerary.budget).toFixed(2)} over budget.`
                  : `You have $${(itinerary.budget - totalCost).toFixed(2)} remaining.`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><Map /> Mini-Map</CardTitle>
          </CardHeader>
          <CardContent>
             {showMap ? (
                 <TripMapLibre activities={mapActivities} />
              ) : (
                <div className="text-center aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
                  <p className="mb-4 text-muted-foreground">See your itinerary on a map.</p>
                  <Button onClick={() => setShowMap(true)}>Show Map</Button>
                </div>
              )}
            {mapActivities.length === 0 && !showMap && (
               <p className="text-sm text-muted-foreground mt-2">Map will be available once activities with locations are generated.</p>
            )}
             {showMap && (
                <Button variant="link" onClick={() => setShowMap(false)} className="mt-2 p-0">Hide Map</Button>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled><Save className="mr-2"/> Save</Button>
              <Button variant="outline" disabled><Share2 className="mr-2"/> Share</Button>
              <Button variant="outline" disabled><FileDown className="mr-2"/> Export PDF</Button>
              <Button variant="outline" disabled><CalendarPlus className="mr-2"/> Add to Calendar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
