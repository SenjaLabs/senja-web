"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  readOKXSession, 
  isOKXConnected, 
  getOKXAddress, 
  getOKXChainId,
  syncOKXWithWagmi 
} from '@/utils/okx-session-reader';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wallet } from 'lucide-react';

interface SessionStatus {
  hasDappPortalSession: boolean;
  dappPortalAddress: string | null;
  dappPortalChainId: number | null;
  hasOKXSession: boolean;
  isOKXConnected: boolean;
  okxAddress: string | null;
  okxChainId: number | null;
  wagmiSynced: boolean;
  sessionData: any;
}

export const WalletSessionIndicator = () => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    hasDappPortalSession: false,
    dappPortalAddress: null,
    dappPortalChainId: null,
    hasOKXSession: false,
    isOKXConnected: false,
    okxAddress: null,
    okxChainId: null,
    wagmiSynced: false,
    sessionData: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const checkSessionStatus = async () => {
    setIsLoading(true);
    addLog('🔍 Checking OKX session status...');

    try {
      // Check DApp Portal session from localStorage
      const dappPortalSession = localStorage.getItem('dapp-portal-session');
      let dappPortalData = null;
      let hasDappPortalSession = false;
      let dappPortalAddress = null;
      let dappPortalChainId = null;
      
      if (dappPortalSession) {
        try {
          dappPortalData = JSON.parse(dappPortalSession);
          const isExpired = Date.now() - dappPortalData.timestamp > 24 * 60 * 60 * 1000;
          if (!isExpired && dappPortalData.account) {
            hasDappPortalSession = true;
            dappPortalAddress = dappPortalData.account;
            dappPortalChainId = dappPortalData.chainId;
          }
        } catch (e) {
          console.warn('Failed to parse DApp Portal session');
        }
      }
      
      addLog(`📦 DApp Portal session: ${hasDappPortalSession ? 'Found' : 'Not found'}`);
      if (dappPortalAddress) {
        addLog(`📍 DApp Portal address: ${dappPortalAddress}`);
        addLog(`⛓️ DApp Portal chain ID: ${dappPortalChainId}`);
      }

      // Check OKX session from localStorage
      const okxSession = readOKXSession();
      addLog(`📦 OKX localStorage session: ${okxSession.isConnected ? 'Found' : 'Not found'}`);

      // Check OKX connection
      const okxConnected = isOKXConnected();
      addLog(`🔗 OKX provider connection: ${okxConnected ? 'Connected' : 'Not connected'}`);

      // Get OKX address
      const okxAddress = getOKXAddress();
      addLog(`📍 OKX address: ${okxAddress || 'Not available'}`);

      // Get OKX chain ID
      const okxChainId = getOKXChainId();
      addLog(`⛓️ OKX chain ID: ${okxChainId || 'Not available'}`);

      // Check Wagmi storage
      const wagmiStore = localStorage.getItem('wagmi.store');
      const recentConnector = localStorage.getItem('recentConnectorId');
      const wagmiSynced = !!(wagmiStore && recentConnector);
      addLog(`🔄 Wagmi sync status: ${wagmiSynced ? 'Synced' : 'Not synced'}`);

      setSessionStatus({
        hasDappPortalSession,
        dappPortalAddress,
        dappPortalChainId,
        hasOKXSession: okxSession.isConnected,
        isOKXConnected: okxConnected,
        okxAddress,
        okxChainId,
        wagmiSynced,
        sessionData: dappPortalData || okxSession.sessionData,
      });

      addLog('✅ Session check completed');
    } catch (error) {
      addLog(`❌ Error checking session: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncWithWagmi = async () => {
    setIsLoading(true);
    addLog('🔄 Syncing OKX session with Wagmi...');

    try {
      const synced = syncOKXWithWagmi();
      if (synced) {
        addLog('✅ Successfully synced OKX session with Wagmi');
        await checkSessionStatus(); // Refresh status
      } else {
        addLog('❌ Failed to sync with Wagmi');
      }
    } catch (error) {
      addLog(`❌ Sync error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    checkSessionStatus();
  }, []);

  return (
    <div className="space-y-4">
      {/* Session Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            OKX Session Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {sessionStatus.hasDappPortalSession ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">DApp Portal</span>
              <Badge variant={sessionStatus.hasDappPortalSession ? "default" : "destructive"}>
                {sessionStatus.hasDappPortalSession ? "Found" : "Not Found"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {sessionStatus.hasOKXSession ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">OKX Session</span>
              <Badge variant={sessionStatus.hasOKXSession ? "default" : "destructive"}>
                {sessionStatus.hasOKXSession ? "Found" : "Not Found"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {sessionStatus.isOKXConnected ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">OKX Connected</span>
              <Badge variant={sessionStatus.isOKXConnected ? "default" : "destructive"}>
                {sessionStatus.isOKXConnected ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {sessionStatus.wagmiSynced ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">Wagmi Synced</span>
              <Badge variant={sessionStatus.wagmiSynced ? "default" : "secondary"}>
                {sessionStatus.wagmiSynced ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {sessionStatus.okxAddress ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Address</span>
              <Badge variant={sessionStatus.okxAddress ? "default" : "destructive"}>
                {sessionStatus.okxAddress ? "Available" : "N/A"}
              </Badge>
            </div>
          </div>

          {/* DApp Portal Address Display */}
          {sessionStatus.dappPortalAddress && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-700">DApp Portal Address:</div>
              <div className="font-mono text-sm text-blue-900 break-all">
                {sessionStatus.dappPortalAddress}
              </div>
            </div>
          )}

          {/* OKX Address Display */}
          {sessionStatus.okxAddress && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">OKX Address:</div>
              <div className="font-mono text-sm text-gray-900 break-all">
                {sessionStatus.okxAddress}
              </div>
            </div>
          )}

          {/* Chain ID Display */}
          {sessionStatus.okxChainId && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Chain ID:</div>
              <div className="font-mono text-sm text-gray-900">
                {sessionStatus.okxChainId}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={checkSessionStatus} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
            
            <Button 
              onClick={handleSyncWithWagmi} 
              disabled={isLoading || !sessionStatus.okxAddress}
              size="sm"
            >
              Sync with Wagmi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Session Logs</span>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Raw Session Data */}
      {sessionStatus.sessionData && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(sessionStatus.sessionData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
