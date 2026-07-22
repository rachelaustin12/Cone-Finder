import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IceCream, Clock, Navigation, Eye, MessageCircle, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import MessageVanModal from './MessageVanModal';
import VanReviews from './VanReviews';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function VanCard({ van, userPosition }) {
  const [showMessage, setShowMessage] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const lastUpdate = van.last_location_update ?
  formatDistanceToNow(new Date(van.last_location_update), { addSuffix: true }) :
  null;

  const distance = userPosition && van.latitude && van.longitude ?
  getDistance(userPosition[0], userPosition[1], van.latitude, van.longitude) :
  null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      
      <Card className="overflow-hidden hover:shadow-md transition-shadow border-border/60 bg-card">
        <CardContent className="p-4">
          <div className="bg-[hsl(var(--color-cream))] flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${van.isSighting ? 'bg-accent/10' : 'bg-primary/10'}`}>
            {van.isSighting ? <Eye className="w-5 h-5 text-accent" /> : <IceCream className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="bg-[hsl(var(--color-cream))] text-[#3dbbff] text-2xl font-thin truncate">{van.name}</h3>
              <div className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${van.isSighting ? 'bg-accent' : 'bg-green-400'}`} />
            </div>
            <p className="text-[hsl(var(--color-mint))] mt-0.5 text-sm font-thin">
              {van.isSighting ?
                `Spotted by ${van.reporter_name || 'a hunter'}` :
                van.driver_name || 'Anonymous Driver'}
            </p>
            {van.note &&
              <p className="text-xs text-muted-foreground mt-0.5">"{van.note}"</p>
              }
            {van.specialties &&
              <div className="flex flex-wrap gap-1 mt-2">
                  {van.specialties.split(',').slice(0, 3).map((s, i) =>
                <Badge key={i} variant="secondary" className="bg-[#d9e1fc] text-[#3b3535] px-1.5 py-0 font-body opacity-100 rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80">
                      {s.trim()}
                    </Badge>
                )}
                </div>
              }
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {distance !== null &&
                  <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                    </span>
                  }
                  {lastUpdate &&
                  <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lastUpdate}
                    </span>
                  }
                </div>
                <div className="flex items-center gap-2">
                  {van.latitude && van.longitude &&
                  <>
                      <a
                      href={`https://waze.com/ul?ll=${van.latitude},${van.longitude}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#06ccff]/10 text-[#06ccff] hover:bg-[#06ccff]/20 transition-colors">
                      
                        Waze
                      </a>
                      <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${van.latitude},${van.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer" className="bg-green-500/10 text-red-600 px-2 py-0.5 text-xs font-semibold rounded-lg hover:bg-green-500/20 transition-colors">
                      
                      
                        Maps
                      </a>
                    </>
                  }
                  {!van.isSighting && van.messages_enabled !== false &&
                  <button
                    onClick={() => setShowMessage(true)} className="bg-[#f5eca8] text-[hsl(var(--accent))] text-xs font-semibold flex items-center gap-1 hover:text-primary/80 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Message me
                    </button>
                  }
                  {!van.isSighting &&
                  <button
                    onClick={() => setShowReviews((s) => !s)}
                    className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-yellow-400/10 text-yellow-600 hover:bg-yellow-400/20 transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Reviews
                  </button>
                  }
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showReviews && !van.isSighting && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <VanReviews vanId={van.id} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      <MessageVanModal open={showMessage} onClose={() => setShowMessage(false)} van={van} />
    </motion.div>);

}