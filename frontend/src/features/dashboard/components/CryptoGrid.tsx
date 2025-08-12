import { Box } from '@mui/material';
import CryptoPriceCard from './CryptoPriceCard';
import type { CryptoPrices } from '../../../types';

interface CryptoGridProps {
  cryptoCurrencies: string[];
  prices: CryptoPrices | null;
}

export const CryptoGrid: React.FC<CryptoGridProps> = ({ cryptoCurrencies, prices }) => (
  <Box
    sx={{
      display: 'grid',
      gap: 3,
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)'
      },
    }}
  >
    {cryptoCurrencies.map((symbol) => (
      <Box key={symbol}>
        <CryptoPriceCard
          symbol={symbol}
          price={prices ? prices[symbol] ?? null : null}
          loading={!prices || !prices[symbol]}
        />
      </Box>
    ))}
  </Box>
);
