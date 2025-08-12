import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, Check} from 'lucide-react';
import { authService } from '@/services/auth';
import Button from '@/components/button';

export default function Settings() {
  const [exchangeStatus, setExchangeStatus] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    privateKey: '',
    walletAddress: '',
  });

  useEffect(() => {
    loadExchangeStatus();
  }, []);

  const loadExchangeStatus = async () => {
    try {
      const status = await authService.getExchangeStatus('hyperliquid');
      setExchangeStatus(status);
    } catch (error) {
      console.error('Failed to load exchange status:', error);
    }
  };

  const handleConnectExchange = async () => {
    setConnecting(true);
    try {
      await authService.connectExchange({
        exchange: 'hyperliquid',
        privateKey: credentials.privateKey,
        walletAddress: credentials.walletAddress,
      });
      
      await loadExchangeStatus();
      setCredentials({ privateKey: '', walletAddress: '' });
      setShowCredentials(false);
    } catch (error) {
      console.error('Failed to connect exchange:', error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
          <p className="text-neutral-600">Configure your trading preferences and connections</p>
        </div>

        {/* Exchange Settings */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Exchange Connections</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">Hyperliquid</h4>
                  <p className="text-sm text-neutral-500">
                    Connect to execute signals directly
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {exchangeStatus?.connected ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                    <span className="text-sm text-neutral-500">
                      Balance: ${exchangeStatus.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {showCredentials && !exchangeStatus?.connected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-50 rounded-lg p-4 border border-neutral-200"
              >
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Your credentials are encrypted and stored securely. Only provide credentials 
                      for accounts you trust with automated trading.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Private Key
                    </label>
                    <input
                      type="password"
                      value={credentials.privateKey}
                      onChange={(e) => setCredentials({ ...credentials, privateKey: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={credentials.walletAddress}
                      onChange={(e) => setCredentials({ ...credentials, walletAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                      placeholder="0x..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setShowCredentials(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleConnectExchange}
                      disabled={connecting || !credentials.privateKey || !credentials.walletAddress}
                    >
                      {connecting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </div>
                      ) : (
                        'Connect Exchange'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Trading Preferences */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Trading Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">Auto-execute signals</h4>
                <p className="text-sm text-neutral-500">
                  Automatically execute purchased signals with your connected exchange
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">Risk management</h4>
                <p className="text-sm text-neutral-500">
                  Apply automatic stop-loss and take-profit orders
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">New signal alerts</h4>
                <p className="text-sm text-neutral-500">
                  Get notified when new high-confidence signals are available
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">Revenue notifications</h4>
                <p className="text-sm text-neutral-500">
                  Get notified when you earn royalties from your IP assets
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">Trade execution alerts</h4>
                <p className="text-sm text-neutral-500">
                  Get notified when trades are executed or positions are closed
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}