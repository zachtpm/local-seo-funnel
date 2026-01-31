'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useFormContext } from '../FormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface FieldErrors {
  businessName?: string;
  address?: string;
}

export function Step2Business() {
  const { formData, updateFormData } = useFormContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isSelected, setIsSelected] = useState(!!formData.placeId || (!!formData.businessName && !!formData.address));
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initServices = () => {
      try {
        if (!window.google?.maps?.places) return;
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        if (mapRef.current) {
          placesService.current = new window.google.maps.places.PlacesService(mapRef.current);
        }
      } catch (error) {
        console.error('Google Maps initialization error:', error);
        setApiError('Unable to load business search. Please enter your business manually.');
        setShowManualEntry(true);
      }
    };

    if (window.google?.maps?.places) {
      initServices();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogle);
          initServices();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google?.maps?.places) {
          setApiError('Business search unavailable. Please enter your business manually.');
          setShowManualEntry(true);
        }
      }, 10000);

      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    if ((formData.placeId && formData.businessName) || (formData.businessName && formData.address)) {
      setIsSelected(true);
    }
  }, [formData.placeId, formData.businessName, formData.address]);

  const searchBusinesses = useCallback((query: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      if (!autocompleteService.current) {
        setApiError('Search unavailable. Please enter your business manually.');
        return;
      }

      setIsLoading(true);
      setApiError('');

      const request: google.maps.places.AutocompletionRequest = {
        input: formData.city ? `${query} ${formData.city}` : query,
        types: ['establishment'],
      };

      autocompleteService.current.getPlacePredictions(request, (results, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
        setShowDropdown(true);
      });
    }, 300);
  }, [formData.city]);

  const selectBusiness = (prediction: PlacePrediction) => {
    if (!placesService.current) {
      setApiError('Unable to fetch business details. Please enter manually.');
      setShowManualEntry(true);
      return;
    }

    setFetchingDetails(true);
    setShowDropdown(false);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['place_id', 'name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'user_ratings_total'],
      },
      (place, status) => {
        setFetchingDetails(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          updateFormData({
            placeId: place.place_id || '',
            businessName: place.name || '',
            address: place.formatted_address || '',
            phone: place.formatted_phone_number || '',
            website: place.website || '',
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
          });
          setIsSelected(true);
          setSearchQuery('');
        } else {
          setApiError('Could not fetch business details. Please try again.');
        }
      }
    );
  };

  const handleChangeSelection = () => {
    setIsSelected(false);
    setShowManualEntry(false);
    setErrors({});
    setTouched({});
    updateFormData({ placeId: '', businessName: '', address: '', phone: '', website: '', rating: 0, reviewCount: 0 });
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (!formData[field]?.trim()) {
      setErrors((prev) => ({ ...prev, [field]: `${field === 'businessName' ? 'Business name' : 'Address'} is required` }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={cn('w-4 h-4', i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-muted fill-current')}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  // Selected business card
  if (isSelected && formData.businessName) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground">Your Business</h2>
          <p className="text-sm text-muted-foreground mt-1">We found your business details</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 via-white to-indigo-50 border-primary/20 shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg">{formData.businessName}</h3>
                <p className="text-muted-foreground text-sm mt-0.5">{formData.address}</p>
              </div>
            </div>

            {formData.rating > 0 && (
              <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-amber-50 rounded-lg w-fit">
                <div className="flex">{renderStars(formData.rating)}</div>
                <span className="text-sm font-medium text-amber-800">
                  {formData.rating.toFixed(1)} ({formData.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            )}

            <div className="mt-4 space-y-1.5">
              {formData.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {formData.phone}
                </p>
              )}

              {formData.website && (
                <p className="text-sm text-muted-foreground flex items-center gap-2 truncate">
                  <svg className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    {formData.website.replace(/^https?:\/\//, '').split('/')[0]}
                  </a>
                </p>
              )}
            </div>

            <Button variant="link" onClick={handleChangeSelection} className="px-0 mt-4 h-auto text-primary font-medium">
              Change selection
            </Button>
          </CardContent>
        </Card>

        <div ref={mapRef} style={{ display: 'none' }} />
      </div>
    );
  }

  // Manual entry form
  if (showManualEntry) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground">Enter Business Details</h2>
          <p className="text-sm text-muted-foreground mt-1">Tell us about your business</p>
        </div>

        {apiError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">{apiError}</div>
        )}

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name <span className="text-destructive">*</span></Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => updateFormData({ businessName: e.target.value })}
            onBlur={() => handleBlur('businessName')}
            placeholder="Your Business Name"
            className={cn('h-11', errors.businessName && touched.businessName && 'border-destructive')}
          />
          {errors.businessName && touched.businessName && (
            <p className="text-destructive text-xs">{errors.businessName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            onBlur={() => handleBlur('address')}
            placeholder="123 Main St, City, State"
            className={cn('h-11', errors.address && touched.address && 'border-destructive')}
          />
          {errors.address && touched.address && (
            <p className="text-destructive text-xs">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => updateFormData({ website: e.target.value })}
              placeholder="https://example.com"
              className="h-11"
            />
          </div>
        </div>

        <Button variant="link" onClick={() => setShowManualEntry(false)} className="px-0 h-auto text-primary">
          ← Back to search
        </Button>

        <div ref={mapRef} style={{ display: 'none' }} />
      </div>
    );
  }

  // Search view
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Find Your Business</h2>
        <p className="text-sm text-muted-foreground mt-1">Search for your business on Google</p>
      </div>

      {apiError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">{apiError}</div>
      )}

      <div className="relative space-y-2">
        <Label htmlFor="businessSearch">Business Name <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Input
            id="businessSearch"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); searchBusinesses(e.target.value); }}
            onFocus={() => predictions.length > 0 && setShowDropdown(true)}
            placeholder="Start typing your business name..."
            className="h-11"
            autoComplete="off"
            disabled={fetchingDetails}
          />
          {(isLoading || fetchingDetails) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        {showDropdown && !isLoading && !fetchingDetails && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg border max-h-64 overflow-y-auto">
            {predictions.length > 0 ? (
              predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  onClick={() => selectBusiness(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-accent border-b border-border last:border-b-0 transition-colors"
                >
                  <p className="font-medium text-foreground">{prediction.structured_formatting.main_text}</p>
                  <p className="text-sm text-muted-foreground truncate">{prediction.structured_formatting.secondary_text}</p>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">No businesses found. Try a different search term.</div>
            )}
          </Card>
        )}
      </div>

      {searchQuery.length > 0 && searchQuery.length < 3 && (
        <p className="text-xs text-muted-foreground">Type at least 3 characters to search</p>
      )}

      <Button variant="link" onClick={() => setShowManualEntry(true)} className="px-0 h-auto text-primary">
        Can't find your business? Enter manually
      </Button>

      <div ref={mapRef} style={{ display: 'none' }} />
    </div>
  );
}

export function validateStep2(formData: { businessName: string; address: string }): boolean {
  return formData.businessName.trim() !== '' && formData.address.trim() !== '';
}
