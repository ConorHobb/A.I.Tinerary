'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, DollarSign, CalendarDays, Users, Accessibility, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateItineraryAction } from '@/lib/actions';
import type { FullItinerary, ItineraryDay } from '@/lib/types';

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  startDate: z.date({ required_error: 'A start date is required.' }),
  length: z.coerce.number().min(1, { message: 'Trip must be at least 1 day.' }).max(14, { message: 'Trip cannot be longer than 14 days.' }),
  budget: z.coerce.number().min(1, { message: 'Budget must be a positive number.' }),
  preferences: z.string().min(10, { message: 'Please describe your preferences in at least 10 characters.' }),
  pace: z.enum(['relaxed', 'moderate', 'busy'], { required_error: 'You need to select a pace.' }),
  accessibilityNeeds: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ItineraryFormProps {
  setIsLoading: (isLoading: boolean) => void;
  onItineraryGenerated: (itinerary: FullItinerary) => void;
  onError: (error: string) => void;
}

export default function ItineraryForm({ setIsLoading, onItineraryGenerated, onError }: ItineraryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      length: 7,
      budget: 2000,
      preferences: 'A mix of famous landmarks, local cuisine, and some time for shopping.',
      pace: 'moderate',
      accessibilityNeeds: 'None',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const input = {
        ...values,
        startDate: format(values.startDate, 'yyyy-MM-dd'),
      };
      const result = await generateItineraryAction(input);
      
      if (!result || result.length === 0) {
        throw new Error('The AI failed to generate an itinerary. This might be due to an unusual request. Please try again with different parameters.');
      }
      
      const fullItinerary: FullItinerary = {
        destination: values.destination,
        startDate: input.startDate,
        length: values.length,
        budget: values.budget,
        days: result,
      };
      onItineraryGenerated(fullItinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      onError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Let's Plan Your Next Adventure!</CardTitle>
          <CardDescription>Fill in the details below, and our AI will craft a personalized itinerary just for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="e.g., Paris, France" {...field} className="pl-10" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                >
                                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || date > new Date(new Date().setFullYear(new Date().getFullYear() + 2))} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trip Length (days)</FormLabel>
                             <div className="relative">
                               <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <FormControl>
                                <Input type="number" placeholder="e.g., 7" {...field} className="pl-10"/>
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (USD)</FormLabel>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input type="number" placeholder="e.g., 2000" {...field} className="pl-10" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pace"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Desired Pace</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col md:flex-row gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="relaxed" />
                              </FormControl>
                              <FormLabel className="font-normal">Relaxed</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="moderate" />
                              </FormControl>
                              <FormLabel className="font-normal">Moderate</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="busy" />
                              </FormControl>
                              <FormLabel className="font-normal">Busy</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferences & Interests</FormLabel>
                         <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Textarea placeholder="Tell us what you love to do! e.g., 'I'm a foodie who loves history, museums, and street art.'" {...field} className="pl-10 min-h-[138px]" />
                            </FormControl>
                        </div>
                        <FormDescription>The more details, the better the itinerary!</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accessibilityNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accessibility Needs</FormLabel>
                         <div className="relative">
                          <Accessibility className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Textarea placeholder="e.g., wheelchair accessible routes, step-free access to attractions" {...field} className="pl-10 min-h-[138px]" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate My Itinerary
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
