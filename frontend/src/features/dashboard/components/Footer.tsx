import { Box, Container, Typography, useTheme } from '@mui/material';

export const Footer: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light'
          ? theme.palette.grey[200]
          : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Crypto Tracker. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
