'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getOrgWebhook, createOrgWebhook, regenerateWebhookApiKey } from '@/lib/api/webhook';

// Mask key: show first 4, last 4, hide middle
const maskApiKey = (key: string): string => {
  if (key.length <= 8) return '*'.repeat(key.length);
  return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
};

export function Webhook() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKeyPreview, setApiKeyPreview] = useState(''); // masked version for display when hidden
  const [rawApiKey, setRawApiKey] = useState<string | null>(null); // full key (temporary)
  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const clearRawKey = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setRawApiKey(null);
  };

  const setupAutoHide = (key: string) => {
    clearRawKey();
    setRawApiKey(key);
    setApiKeyPreview(maskApiKey(key)); // also update preview for consistency
    hideTimer.current = setTimeout(() => {
      setRawApiKey(null);
      toast('API key hidden for security', { icon: <EyeOff className="h-4 w-4" /> });
    }, 60_000);
  };

  // Fetch or create webhook on mount
  useEffect(() => {
    const initializeWebhook = async () => {
      try {
        // Step 1: Try to fetch existing webhook
        const getRes = await getOrgWebhook();

        if (getRes.ok) {
          const data = await getRes.json();
          // GET response has: { webhook_id, url } — NO api_key
          if (data.url) {
            setWebhookUrl(data.url);
            // We don't have the API key from GET, so show masked placeholder
            setApiKeyPreview('****');
            setIsLoading(false);
            return;
          }
        }

        // Step 2: If not found or invalid, create a new one
        const createRes = await createOrgWebhook();
        if (!createRes.ok) throw new Error('Failed to create webhook');
        const newData = await createRes.json();
        // POST response has: { url, api_key }
        setWebhookUrl(newData.url);
        setupAutoHide(newData.api_key); // show raw key + auto-hide
        toast.success('Webhook created! Copy your API key now.');
      } catch (error: any) {
        console.error('Webhook initialization error:', error);
        toast.error(error.message || 'Failed to set up webhook');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWebhook();

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Regenerate API key
  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const res = await regenerateWebhookApiKey();
      if (!res.ok) throw new Error('Failed to regenerate API key');
      const data = await res.json();
      // Regenerate response has: { webhook_id, api_key, url }
      setWebhookUrl(data.url);
      setupAutoHide(data.api_key);
      setShowRegenDialog(false);
      toast.success('New API key generated! Copy it now.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate key');
      setShowRegenDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  if (isLoading) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const displayKey = rawApiKey || apiKeyPreview;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Webhook Configuration</CardTitle>
        <CardDescription>
          Your endpoint for receiving alerts. The API key is required to authenticate requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Webhook URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Webhook URL</label>
          <div className="flex">
            <Input value={webhookUrl} readOnly className="rounded-r-none bg-muted" />
            <Button
              variant="outline"
              className="rounded-l-none border-l-0"
              onClick={() => navigator.clipboard.writeText(webhookUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">API Key</label>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowRegenDialog(true)}
              className="h-6 px-0 text-destructive hover:text-destructive/90"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Regenerate
            </Button>
          </div>
          <div className="flex">
            <Input
              value={displayKey}
              readOnly
              type={rawApiKey ? 'text' : 'password'}
              className="rounded-r-none bg-muted font-mono"
            />
            <Button
              variant="outline"
              className="rounded-l-none border-l-0"
              onClick={() => copyKey(displayKey)}
              disabled={!rawApiKey}
              title={!rawApiKey ? 'Key hidden (regenerate to view)' : 'Copy key'}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {rawApiKey && (
            <p className="text-xs text-muted-foreground">
              Key will auto-hide in <b>60 seconds</b> for security.
            </p>
          )}
          {!rawApiKey && (
            <p className="text-xs text-muted-foreground">
              Regenerate to view your API key (it will be shown once).
            </p>
          )}
        </div>
      </CardContent>

      {/* Regenerate Confirmation */}
      <AlertDialog open={showRegenDialog} onOpenChange={setShowRegenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate your current key. All services using it will stop receiving alerts until updated with the new key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate} disabled={isLoading}>
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}