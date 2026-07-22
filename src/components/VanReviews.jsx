import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VanReviews({ vanId }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['van-reviews', vanId],
    queryFn: () => base44.entities.VanReview.filter({ van_id: vanId }),
    enabled: !!vanId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-2 text-center">
        No reviews yet — be the first to leave one!
      </p>
    );
  }

  const avg = (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs">
        <span className="flex items-center gap-0.5 font-semibold text-foreground">
          {avg}
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        </span>
        <span className="text-muted-foreground">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
      </div>
      {reviews.map((r) => (
        <div key={r.id} className="bg-muted/40 rounded-xl p-2.5 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-foreground">{r.reviewer_name || 'Anonymous'}</span>
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= r.rating ? 'text-yellow-400' : 'text-muted-foreground/30'}>★</span>
              ))}
            </span>
          </div>
          {r.comment && <p className="text-muted-foreground leading-relaxed">{r.comment}</p>}
          {r.photo_url && (
            <img src={r.photo_url} alt="Review" className="mt-2 rounded-lg max-h-24 object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}