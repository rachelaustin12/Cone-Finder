import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { IceCream, Loader2, Plus, Star, ArrowLeft, Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import VanMap from '../components/VanMap';
import VanCard from '../components/VanCard';
import ReportSightingModal from '../components/ReportSightingModal';
import AddReviewModal from '../components/AddReviewModal';
import { useProximityAlerts } from '../hooks/useProximityAlerts';

export default function Find() {
  const navigate = useNavigate();
  const [userPos, setUserPos] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(() => localStorage.getItem('cone_finder_alerts') === 'true');
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [pullDelta, setPullDelta] = useState(0);
  const mainRef = useRef(null);
  const pullStartY = useRef(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['active-vans'] }),
      queryClient.invalidateQueries({ queryKey: ['van-sightings'] }),
    ]);
    setTimeout(() => setRefreshing(false), 600);
  }, [queryClient]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) pullStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (pullStartY.current === null) return;
      const delta = e.touches[0].clientY - pullStartY.current;
      if (delta > 0) setPullDelta(Math.min(delta, 80));
      else { pullStartY.current = null; setPullDelta(0); }
    };
    const onTouchEnd = () => {
      if (pullDelta > 60) handleRefresh();
      pullStartY.current = null;
      setPullDelta(0);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDelta, handleRefresh]);


  const { data: vans = [], isLoading } = useQuery({
    queryKey: ['active-vans'],
    queryFn: () => base44.entities.IceCreamVan.filter({ is_active: true }),
    refetchInterval: 15000
  });

  const { data: sightings = [] } = useQuery({
    queryKey: ['van-sightings'],
    queryFn: async () => {
      const all = await base44.entities.VanSighting.list('-created_date', 100);
      const now = new Date();
      return all.filter((s) => !s.expires_at || new Date(s.expires_at) > now);
    },
    refetchInterval: 30000
  });

  // Merge sightings as pseudo-vans for the map (vans not already sharing live location)
  const sightingVans = sightings.
  filter((s) => !vans.find((v) => v.id === s.van_id)).
  map((s) => ({
    id: `sighting-${s.id}`,
    name: s.van_name,
    latitude: s.latitude,
    longitude: s.longitude,
    is_active: true,
    isSighting: true,
    note: s.note,
    reporter_name: s.reporter_name,
    last_location_update: s.created_date
  }));

  const allVans = [...vans, ...sightingVans];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  useProximityAlerts(alertsEnabled ? vans : [], userPos);

  const toggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    localStorage.setItem('cone_finder_alerts', String(next));
  };

  return (
    <div ref={mainRef} className="min-h-screen overflow-y-auto bg-background font-nunito">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-3 h-14">
          <button onClick={() => navigate('/')} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-muted transition-colors gap-1.5 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <span className="text-xl">🗺️</span>
          <h1 className="text-[hsl(var(--color-sky))] text-lg font-semibold flex-1">Find Vans</h1>
          <button
            onClick={toggleAlerts}
            className={`min-h-[36px] flex items-center justify-center gap-1.5 rounded-xl border px-2.5 transition-colors text-xs font-semibold ${alertsEnabled ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-muted border-border text-muted-foreground'}`}
          >
            {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{alertsEnabled ? 'Alerts on' : 'Get alerts'}</span>
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReviewModal(true)} className="bg-[#f094b1] text-[hsl(var(--secondary))] px-3 text-lg font-thin rounded-xl inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8 gap-1.5">
            <Star className="w-4 h-4" />
            Review
          </Button>
          <Button
            size="sm"
            onClick={() => setShowModal(true)} className="bg-[#1499d2] text-[hsl(var(--background))] px-3 text-base font-thin rounded-xl inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-8 gap-1.5 hover:bg-accent/90">
            
            
            <Plus className="w-4 h-4" />
            I found one!
          </Button>
        </div>
      </header>

      {/* Pull-to-refresh indicator */}
      {(pullDelta > 10 || refreshing) && (
        <div className="sticky top-14 left-0 right-0 z-40 flex justify-center pointer-events-none -mb-8">
          <div className={`mt-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow transition-all ${refreshing ? 'opacity-100' : 'opacity-70'}`}>
            {refreshing ? '↻ Refreshing...' : pullDelta > 60 ? '↑ Release to refresh' : '↓ Pull to refresh'}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}>
          
          <VanMap vans={allVans} className="h-[50vh] mb-6" />
        </motion.div>

        <div className="mb-4 flex items-center gap-2">
          <IceCream className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-thin">
            Active Vans
            {allVans.length > 0 &&
            <span className="text-muted-foreground font-inter text-sm font-normal ml-2">({allVans.length})</span>
            }
          </h2>
        </div>

        {isLoading ?
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div> :
        allVans.length === 0 ?
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-4">
          
            <div className="text-5xl mb-4">🍨</div>
            <h3 className="font-pacifico text-xl mb-1">No vans spotted yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Be the first to report a sighting!
            </p>
            <Button onClick={() => setShowModal(true)} className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
              📍 I found a van!
            </Button>
          </motion.div> :

        <div className="grid gap-3 sm:grid-cols-2">
            {allVans.map((van) =>
          <VanCard key={van.id} van={van} userPosition={userPos} />
          )}
          </div>
        }
      </main>

      <ReportSightingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        vans={vans}
        onReported={() => queryClient.invalidateQueries({ queryKey: ['van-sightings'] })} />
      
      <AddReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewed={() => {}} />
      
    </div>);

}