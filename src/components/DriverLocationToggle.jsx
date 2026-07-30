import React, { useEffect, useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getCurrentLocation } from '@/lib/geolocation';

export default function DriverLocationToggle({ van, onUpdate }) {
  const watchRef = useRef(null);
  // Optimistic local state — reflects UI instantly
  const [optimisticActive, setOptimisticActive] = useState(van.is_active);

  // Keep in sync if parent updates (e.g. after page refetch)
  useEffect(() => {
    setOptimisticActive(van.is_active);
  }, [van.is_active]);

  const startSharing = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setOptimisticActive(false);
      return;
    }

    try {
      // Confirm permission with an accurate single read before watching
      await getCurrentLocation();

      // Permission granted — now start watching for live updates
      watchRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          // Guard against NaN values that break the map
          if (isNaN(pos.coords.latitude) || isNaN(pos.coords.longitude)) return;
          const data = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            is_active: true,
            last_location_update: new Date().toISOString(),
          };
          try {
            await base44.entities.IceCreamVan.update(van.id, data);
            onUpdate({ ...van, ...data });
          } catch (e) {
            toast.error("Failed to update location. Check your connection.");
          }
        },
        (err) => {
          toast.error(err.code === 1
            ? "Lost location permission. Please re-enable it in your settings."
            : "Lost location signal — check your GPS or move to an open area.");
          setOptimisticActive(false);
          onUpdate({ ...van, is_active: false });
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
    } catch (err) {
      const msg = err.code === 1
        ? "Location permission denied. Please enable it in your browser/device settings."
        : "Could not get your location. Please try again in a location with better signal.";
      toast.error(msg);
      setOptimisticActive(false);
      onUpdate({ ...van, is_active: false });
    }
  };

  const stopSharing = async () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    const data = { is_active: false };
    await base44.entities.IceCreamVan.update(van.id, data);
    onUpdate({ ...van, ...data });
  };

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  const handleToggle = (checked) => {
    // Optimistic update — flip immediately
    setOptimisticActive(checked);
    if (checked) {
      startSharing();
      toast.success("You're now sharing your location!");
    } else {
      stopSharing();
      toast("Location sharing stopped");
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${optimisticActive ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-muted/50 border-border'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${optimisticActive ? 'bg-green-100 dark:bg-green-900/40' : 'bg-muted'}`}>
        <MapPin className={`w-5 h-5 ${optimisticActive ? 'text-green-600' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1">
        <Label className="font-heading font-semibold text-sm">
          {optimisticActive ? 'Sharing Location' : 'Location Off'}
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          {optimisticActive ? 'Customers can find you on the map' : 'Turn on to let customers find you'}
        </p>
      </div>
      <Switch checked={optimisticActive} onCheckedChange={handleToggle} />
    </div>
  );
}