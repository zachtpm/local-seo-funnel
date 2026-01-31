'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFormContext } from '../FormContext';
import { FunnelButton } from './FunnelButton';
import { motion, AnimatePresence } from 'framer-motion';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function BusinessField() {
  const { currentField, formData, updateFormData, nextField, prevField } = useFormContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSelected, setIsSelected] = useState(!!formData.businessName && !!formData.address);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState(formData.businessName || '');
  const [manualAddress, setManualAddress] = useState(formData.address || '');

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSelected && !showManualEntry) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSelected, showManualEntry]);

  useEffect(() => {
    const initServices = () => {
      if (!window.google?.maps?.places) return;
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      if (mapRef.current) {
        placesService.current = new window.google.maps.places.PlacesService(mapRef.current);
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
      return () => clearInterval(checkGoogle);
    }
  }, []);

  const searchBusinesses = useCallback((query: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      if (!autocompleteService.current) return;

      setIsLoading(true);

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
        }
      }
    );
  };

  const handleContinue = () => {
    if (showManualEntry) {
      if (!manualName.trim() || !manualAddress.trim()) return;
      updateFormData({
        businessName: manualName.trim(),
        address: manualAddress.trim(),
        placeId: '',
        phone: '',
        website: '',
        rating: 0,
        reviewCount: 0,
      });
    }
    nextField();
  };

  const handleChangeSelection = () => {
    setIsSelected(false);
    setShowManualEntry(false);
    updateFormData({ placeId: '', businessName: '', address: '', phone: '', website: '', rating: 0, reviewCount: 0 });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-gray-300 fill-current'}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  // Selected business view
  if (isSelected && formData.businessName) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight">
          Is this your business?
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 text-lg">{formData.businessName}</h3>
          <p className="text-gray-500 text-sm mt-1">{formData.address}</p>

          {formData.rating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">{renderStars(formData.rating)}</div>
              <span className="text-sm text-gray-600">
                {formData.rating.toFixed(1)} ({formData.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          )}

          <button
            onClick={handleChangeSelection}
            className="text-blue-600 text-sm font-medium mt-4 hover:underline"
          >
            Not your business? Search again
          </button>
        </motion.div>

        <div className="space-y-3 pt-2">
          <FunnelButton onClick={handleContinue}>
            Yes, continue
          </FunnelButton>
          <FunnelButton variant="back" onClick={prevField}>
            Back
          </FunnelButton>
        </div>

        <div ref={mapRef} style={{ display: 'none' }} />
      </div>
    );
  }

  // Manual entry view
  if (showManualEntry) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight">
          Enter your business details
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Business name"
            className="w-full h-14 px-4 rounded-xl text-lg bg-white border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
          />
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Business address"
            className="w-full h-14 px-4 rounded-xl text-lg bg-white border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-3 pt-2">
          <FunnelButton onClick={handleContinue} disabled={!manualName.trim() || !manualAddress.trim()}>
            Continue
          </FunnelButton>
          <FunnelButton variant="back" onClick={() => setShowManualEntry(false)}>
            Back to search
          </FunnelButton>
        </div>

        <div ref={mapRef} style={{ display: 'none' }} />
      </div>
    );
  }

  // Search view
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight">
        {currentField.label}
      </h1>

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchBusinesses(e.target.value);
            }}
            onFocus={() => predictions.length > 0 && setShowDropdown(true)}
            placeholder={currentField.placeholder}
            className="w-full h-14 px-4 pr-12 rounded-xl text-lg bg-white border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-gray-400"
            autoComplete="off"
            disabled={fetchingDetails}
          />
          {(isLoading || fetchingDetails) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showDropdown && !isLoading && !fetchingDetails && predictions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto"
            >
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  onClick={() => selectBusiness(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <p className="font-medium text-gray-900">{prediction.structured_formatting.main_text}</p>
                  <p className="text-sm text-gray-500 truncate">{prediction.structured_formatting.secondary_text}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {searchQuery.length > 0 && searchQuery.length < 3 && (
        <p className="text-gray-400 text-sm text-center">Type at least 3 characters to search</p>
      )}

      <button
        onClick={() => setShowManualEntry(true)}
        className="text-blue-600 text-sm font-medium hover:underline mx-auto block"
      >
        Can't find your business? Enter manually
      </button>

      <div className="space-y-3 pt-2">
        <FunnelButton variant="back" onClick={prevField}>
          Back
        </FunnelButton>
      </div>

      <div ref={mapRef} style={{ display: 'none' }} />
    </div>
  );
}
