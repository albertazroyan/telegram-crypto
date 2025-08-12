import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { ConnectionStatus } from './ConnectionStatus';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  isConnected: boolean;
  user: {
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  } | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, user, onLogout }) => (
  <AppBar position="static" color="default" elevation={1}>
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Crypto Tracker
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ConnectionStatus isConnected={isConnected} />
        <UserMenu user={user} onLogout={onLogout} />
      </Box>
    </Toolbar>
  </AppBar>
);
