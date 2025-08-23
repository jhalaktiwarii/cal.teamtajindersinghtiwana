"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Birthday } from '@/app/types/birthday';

interface DuplicateRemovalModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface DuplicateGroup {
  key: string;
  entries: Birthday[];
  keepEntry: Birthday | null;
}

export default function DuplicateRemovalModal({ open, onClose, onComplete }: DuplicateRemovalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalProgress, setRemovalProgress] = useState<{ current: number; total: number } | null>(null);

  // Fetch all birthdays and find duplicates
  const findDuplicates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/birthdays');
      if (!response.ok) {
        throw new Error('Failed to fetch birthdays');
      }
      
      const birthdays: Birthday[] = await response.json();
      
      // Group by duplicate criteria (ALL fields must match exactly)
      const groups = new Map<string, Birthday[]>();
      
      birthdays.forEach(birthday => {
        // Create a comprehensive key that includes ALL fields
        const key = `${birthday.fullName.toLowerCase().trim()}_${birthday.day}_${birthday.month}_${birthday.phone || 'NO_PHONE'}_${birthday.address || 'NO_ADDRESS'}_${birthday.ward || 'NO_WARD'}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(birthday);
      });
      
      // Filter only groups with duplicates
      const duplicateGroups: DuplicateGroup[] = [];
      groups.forEach((entries, key) => {
        if (entries.length > 1) {
          duplicateGroups.push({
            key,
            entries: entries.sort((a, b) => {
              // Sort by creation time (newest first) or by ID
              return new Date(b.id).getTime() - new Date(a.id).getTime();
            }),
            keepEntry: entries[0] // Keep the first (newest) entry by default
          });
        }
      });
      
      setDuplicateGroups(duplicateGroups);
      
      if (duplicateGroups.length === 0) {
        toast.success('No duplicates found!');
      } else {
        toast.info(`Found ${duplicateGroups.length} groups with duplicates`);
      }
    } catch (error) {
      console.error('Error finding duplicates:', error);
      toast.error('Failed to find duplicates');
    } finally {
      setIsLoading(false);
    }
  };

  // Set which entry to keep in a duplicate group
  const setKeepEntry = (groupKey: string, entryId: string) => {
    setDuplicateGroups(prev => prev.map(group => {
      if (group.key === groupKey) {
        const keepEntry = group.entries.find(entry => entry.id === entryId);
        return { ...group, keepEntry: keepEntry || null };
      }
      return group;
    }));
  };

  // Remove duplicates
  const removeDuplicates = async () => {
    if (duplicateGroups.length === 0) {
      toast.error('No duplicates to remove');
      return;
    }

    setIsRemoving(true);

    try {
      // Collect all IDs to remove
      const idsToRemove: string[] = [];
      for (const group of duplicateGroups) {
        if (!group.keepEntry) continue;
        const entriesToRemove = group.entries.filter(entry => entry.id !== group.keepEntry!.id);
        idsToRemove.push(...entriesToRemove.map(entry => entry.id));
      }

      if (idsToRemove.length === 0) {
        toast.error('No duplicates to remove');
        return;
      }

      // Use bulk delete for better performance
      const response = await fetch('/api/birthdays/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: idsToRemove }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove duplicates');
      }

      const result = await response.json();
      
      if (result.successful > 0) {
        toast.success(`Successfully removed ${result.successful} duplicate entries`);
        if (result.failed > 0) {
          toast.warning(`${result.failed} entries failed to remove`);
        }
        onComplete();
        handleClose();
      } else {
        toast.error('Failed to remove any duplicates');
      }
    } catch (error) {
      console.error('Error removing duplicates:', error);
      toast.error('Failed to remove duplicates');
    } finally {
      setIsRemoving(false);
      setRemovalProgress(null);
    }
  };

  const handleClose = () => {
    setDuplicateGroups([]);
    setRemovalProgress(null);
    onClose();
  };

  useEffect(() => {
    if (open) {
      findDuplicates();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Remove Duplicate Entries
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-800">Duplicate Detection</span>
            </div>
            <p className="text-sm text-blue-700">
              This tool finds entries where <strong>ALL fields match exactly</strong> (name, day, month, phone, address, ward). 
              For each group, select which entry to keep (the others will be deleted).
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Finding duplicates...</span>
            </div>
          )}

          {/* No Duplicates Found */}
          {!isLoading && duplicateGroups.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicates Found</h3>
              <p className="text-gray-600">Your database is clean! No duplicate entries detected.</p>
            </div>
          )}

          {/* Duplicate Groups */}
          {!isLoading && duplicateGroups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {duplicateGroups.length} Duplicate Groups Found
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={findDuplicates}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {duplicateGroups.map((group, groupIndex) => (
                <div key={group.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Group {groupIndex + 1}: {group.entries[0].fullName} ({group.entries[0].day}/{group.entries[0].month})
                    </h4>
                    <span className="text-sm text-gray-500">
                      {group.entries.length} entries
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          group.keepEntry?.id === entry.id
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="font-medium">{entry.fullName}</span>
                              <span className="text-gray-500 ml-2">
                                {entry.day}/{entry.month}
                              </span>
                            </div>
                            {entry.phone && (
                              <span className="text-sm text-gray-600">{entry.phone}</span>
                            )}
                            {entry.address && (
                              <span className="text-sm text-gray-600 truncate max-w-40" title={entry.address}>
                                {entry.address}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {entry.id}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`group-${group.key}`}
                            checked={group.keepEntry?.id === entry.id}
                            onChange={() => setKeepEntry(group.key, entry.id)}
                            className="text-green-600"
                          />
                          <span className="text-sm text-gray-600">
                            {group.keepEntry?.id === entry.id ? 'Keep' : 'Remove'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isRemoving}>
              Cancel
            </Button>
            
            {duplicateGroups.length > 0 && (
              <Button
                onClick={removeDuplicates}
                disabled={isRemoving || duplicateGroups.some(group => !group.keepEntry)}
                className="bg-red-500 hover:bg-red-600"
              >
                {isRemoving ? (
                  <span className="flex items-center gap-2">
                    {removalProgress ? (
                      `Removing ${removalProgress.current}/${removalProgress.total}...`
                    ) : (
                      'Removing...'
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Remove {duplicateGroups.reduce((sum, group) => sum + group.entries.length - 1, 0)} Duplicates
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
