import React, { useState } from 'react';
import { Scan, Loader2 } from 'lucide-react';
import { useFatSecret } from '../../hooks/useFatSecret';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface BarcodeScannerProps {
  onProductFound?: (product: any) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onProductFound }) => {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<any>(null);
  const { lookupBarcode, loading, error } = useFatSecret();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const lookupResult = await lookupBarcode(barcode.trim());
    setResult(lookupResult);

    if (lookupResult && onProductFound) {
      onProductFound(lookupResult);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleLookup} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter barcode number"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          icon={<Scan size={20} />}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading || !barcode.trim()}
          className="px-6"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
        </Button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && result.food_id && (
        <div className="bg-primary-800/50 border border-primary-700/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Product Found!</h3>
          <p className="text-gray-300">Food ID: {result.food_id.value}</p>
          {result.nutrition && (
            <div className="mt-3">
              <h4 className="font-medium text-white mb-2">
                {result.nutrition.food.food_name}
              </h4>
              <p className="text-sm text-gray-400">
                Nutrition information available
              </p>
            </div>
          )}
        </div>
      )}

      {result && result.error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">
            Product not found in database
          </p>
        </div>
      )}
    </div>
  );
};