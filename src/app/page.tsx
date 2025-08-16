'use client';

import { useState } from 'react';
import { PlaneTakeoff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItineraryForm from '@/components/itinerary-form';
import ItineraryDisplay from '@/components/itinerary-display';
import type { FullItinerary } from '@/lib/types';

export default function Home() {
  const [itinerary, setItinerary] = useState<FullItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleItineraryGenerated = (data: FullItinerary) => {
    setItinerary(data);
    setIsLoading(false);
    setError(null);
  };

  const handleReset = () => {
    setItinerary(null);
    setError(null);
  };
  
  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-4 md:px-6 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <PlaneTakeoff className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">WanderWise</h1>
        </div>
        {itinerary && (
          <Button variant="ghost" onClick={handleReset}>
            New Trip
          </Button>
        )}
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8 flex">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <h2 className="font-headline text-2xl font-semibold">Crafting your perfect adventure...</h2>
            <p className="text-muted-foreground max-w-md">Our AI is planning your trip, considering all your preferences. This can take up to a minute, so please be patient.</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-center">
            <h2 className="font-headline text-2xl font-semibold text-destructive">Oops! Something went wrong.</h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button onClick={handleReset}>Try Again</Button>
          </div>
        ) : itinerary ? (
          <ItineraryDisplay itinerary={itinerary} setItinerary={setItinerary} />
        ) : (
          <ItineraryForm
            setIsLoading={setIsLoading}
            onItineraryGenerated={handleItineraryGenerated}
            onError={handleGenerationError}
          />
        )}
      </main>
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
        <p>Powered by WanderWise AI</p>
      </footer>
    </div>
  );
}
