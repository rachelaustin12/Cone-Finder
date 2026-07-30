import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, ChevronDown, Plus } from 'lucide-react';
import { getCurrentLocation } from '@/lib/geolocation';

function VanPicker({ vans, selectedVanId, onSelect, onAddNew }) {
  const [open, setOpen] = useState(false);
  const selected = vans.find((v) => v.id === selectedVanId);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-xl bg-background text-sm text-left hover:bg-muted/40 transition-colors">
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.name : 'Select a van...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[150]" onPointerDown={() => setOpen(false)} />
          <div role="listbox" className="absolute z-[160] top-full mt-1 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {vans.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">No vans registered yet</div>
          )}
          {vans.map((v) => (
            <button
              key={v.id}
              type="button"
              role="option"
              aria-selected={selectedVanId === v.id}
              onPointerDown={(e) => { e.preventDefault(); onSelect(v.id); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted ${
                selectedVanId === v.id ? 'bg-primary/10 text-primary font-semibold' : ''
              }`}>
              {v.name}
            </button>
          ))}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); onAddNew(); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-muted text-primary font-semibold flex items-center gap-2 border-t border-input">
            <Plus className="w-4 h-4" /> Add a new van...
          </button>
        </div>
        </>
      )}
    </div>
  );
}

export default function ReportSightingModal({ open, onClose, vans, onReported }) {
  const [selectedVanId, setSelectedVanId] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVanName, setNewVanName] = useState('');
  const [note, setNote] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setSelectedVanId('');
    setIsAddingNew(false);
    setNewVanName('');
    setNote('');
    setReporterName('');
  };

  const handleReport = async () => {
    if (!isAddingNew && !selectedVanId) { toast.error('Please select a van'); return; }
    if (isAddingNew && !newVanName.trim()) { toast.error('Please enter the van name'); return; }
    if (!navigator.geolocation) { toast.error('Geolocation not supported on this device'); return; }

    setLoading(true);

    try {
      // 1. Create the van FIRST (decoupled from location so it works even if GPS is slow)
      let vanId = selectedVanId;
      let vanName = vans.find((v) => v.id === selectedVanId)?.name;

      if (isAddingNew) {
        const newVan = await base44.entities.IceCreamVan.create({
          name: newVanName.trim(),
          driver_email: 'unknown@unknown.com',
          is_active: false,
        });
        vanId = newVan.id;
        vanName = newVan.name;
        onReported(); // refresh van list so the new van shows up
      }

      // 2. Get the most accurate location available (retry + fallback built in)
      let coords;
      try {
        coords = await getCurrentLocation();
      } catch (locErr) {
        setLoading(false);
        if (locErr.code === 1) {
          toast.error('Location access denied. The van was added, but please allow location access in your browser settings to pin it on the map.');
        } else if (locErr.code === 2) {
          toast.error("Location unavailable. The van was added, but we couldn't pinpoint it. Check your device's location settings.");
        } else {
          toast.error("Location timed out. The van was added — try reporting the sighting again from an area with better signal.");
        }
        reset();
        onClose();
        return;
      }

      // 3. Create the sighting with the resolved coordinates
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      await base44.entities.VanSighting.create({
        van_id: vanId,
        van_name: vanName,
        latitude: coords.latitude,
        longitude: coords.longitude,
        reporter_name: reporterName.trim() || null,
        note: note.trim() || null,
        expires_at: endOfDay.toISOString()
      });

      setLoading(false);
      toast.success("Sighting reported! Thanks for helping others find ice cream 🍦");
      reset();
      onClose();
      onReported();
    } catch (e) {
      setLoading(false);
      toast.error('Something went wrong — please try again.');
    }
  };

  const vanSelector = (
    <VanPicker
      vans={vans}
      selectedVanId={selectedVanId}
      onSelect={(id) => { setSelectedVanId(id); setIsAddingNew(false); }}
      onAddNew={() => { setIsAddingNew(true); setSelectedVanId(''); }} />
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onClose(); }}>
      <DialogContent className="rounded-3xl max-w-sm font-nunito">
        <DialogHeader>
          <DialogTitle className="bg-[hsl(var(--muted))] text-[hsl(var(--color-sky))] text-xl font-thin tracking-tight flex items-center gap-2">
            🕵️ I found a van!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Report a sighting to help others find ice cream
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Which van?</Label>
            {vanSelector}
          </div>

          {isAddingNew && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Van name</Label>
              <Input
                placeholder="e.g. Mr Whippy's"
                value={newVanName}
                onChange={(e) => setNewVanName(e.target.value)}
                className="rounded-xl"
                maxLength={60}
                autoFocus />
              <p className="text-xs text-muted-foreground">This will add the van to the map so drivers can claim it later.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Where exactly? <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input placeholder="e.g. Outside the park gates" value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl" maxLength={80} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Your name <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input placeholder="e.g. Sarah" value={reporterName} onChange={(e) => setReporterName(e.target.value)} className="rounded-xl" maxLength={40} />
          </div>

          <p className="text-xs text-muted-foreground">
            📍 We'll use your current location to pin the van on the map. Sightings expire at midnight.
          </p>

          <Button onClick={handleReport} disabled={loading} className="w-full rounded-xl">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Getting location...</> : '📍 Share My Location'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}