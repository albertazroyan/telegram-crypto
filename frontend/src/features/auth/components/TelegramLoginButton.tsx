import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botName: string;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: boolean;
  usePic?: boolean;
  lang?: string;
  onAuthCallback?: (user: TelegramUser) => void;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  className?: string;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: TelegramUser) => void;
      Auth?: (container: HTMLElement, options: any, callback: (user: any) => void) => void;
    };
  }
}

const SCRIPT_SRC = 'https://telegram.org/js/telegram-widget.js?22';
const SCRIPT_ID = 'telegram-login-script';

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botName: propBotName,
  buttonSize = 'large',
  cornerRadius = 8,
  requestAccess = true,
  usePic = true,
  lang = 'en',
  onAuthCallback,
  onError,
  onLoad,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInitialized = useRef(false);
  const botName = propBotName || import.meta.env.VITE_TELEGRAM_BOT_NAME || '';

  const handleAuth = useCallback(async (userData: TelegramUser) => {
    try {
      console.log('Handling Telegram auth:', userData);
      if (onAuthCallback) {
        onAuthCallback(userData);
      }
    } catch (error) {
      console.error('Error in handleAuth:', error);
      if (onError) onError(error instanceof Error ? error : new Error('Authentication failed'));
    }
  }, [onAuthCallback, onError]);

  const loadTelegramScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.TelegramLoginWidget) {
        console.log('Telegram widget already loaded');
        resolve();
        return;
      }

      if (document.getElementById(SCRIPT_ID)) {
        const checkInterval = setInterval(() => {
          if (window.TelegramLoginWidget) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.id = SCRIPT_ID;

      script.onload = () => {
        console.log('Telegram widget script loaded');
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error loading Telegram script:', error);
        reject(new Error('Failed to load Telegram script'));
      };

      document.body.appendChild(script);
    });
  }, []);

  const initializeWidget = useCallback(() => {
    if (widgetInitialized.current || !containerRef.current || !botName) {
      if (!botName) {
        const errorMsg = 'Telegram bot name is not configured';
        console.error(errorMsg);
        if (onError) onError(new Error(errorMsg));
      }
      return;
    }

    widgetInitialized.current = true;
    containerRef.current.innerHTML = '';

    // Set the global callback
    window.TelegramLoginWidget = {
      dataOnauth: (user: TelegramUser) => {
        console.log('Telegram auth success:', user);
        handleAuth(user);
      }
    };

    // Create the widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'telegram-login';
    containerRef.current.appendChild(widgetContainer);

    // Initialize the widget
    try {
      const widgetOptions = {
        bot_id: botName.replace('@', ''),
        button: {
          size: buttonSize,
          radius: cornerRadius,
          request_access: requestAccess,
          show_user_photo: usePic,
          lang: lang
        },
        data_auth_url: `${window.location.origin}/api/auth/telegram/callback`,
        request_access: requestAccess,
        widget_version: 22
      };

      if (window.TelegramLoginWidget.Auth) {
        window.TelegramLoginWidget.Auth(widgetContainer, widgetOptions, handleAuth);
      } else {
        // Fallback to script-based initialization
        const script = document.createElement('script');
        script.async = true;
        script.src = SCRIPT_SRC;
        script.setAttribute('data-telegram-login', botName.replace('@', ''));
        script.setAttribute('data-size', buttonSize);
        script.setAttribute('data-radius', cornerRadius.toString());
        script.setAttribute('data-request-access', requestAccess ? 'write' : 'read');
        script.setAttribute('data-userpic', usePic.toString());
        script.setAttribute('data-lang', lang);
        script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
        
        script.onload = () => {
          console.log('Telegram widget script loaded successfully');
          if (onLoad) onLoad();
        };

        script.onerror = (error) => {
          console.error('Error loading Telegram script:', error);
          if (onError) onError(new Error('Failed to load Telegram widget script'));
        };

        containerRef.current.appendChild(script);
      }
    } catch (error) {
      const errorMsg = `Failed to initialize Telegram widget: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      if (onError) onError(new Error(errorMsg));
    }
  }, [botName, buttonSize, cornerRadius, handleAuth, lang, onError, onLoad, requestAccess, usePic]);

  useEffect(() => {
    if (!botName) {
      const errorMsg = 'Telegram bot name is not configured';
      console.error(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    loadTelegramScript()
      .then(() => {
        initializeWidget();
        if (onLoad) onLoad();
      })
      .catch((error) => {
        console.error('Failed to initialize Telegram widget:', error);
        if (onError) onError(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      // Cleanup
      widgetInitialized.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      const script = document.getElementById(SCRIPT_ID);
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.TelegramLoginWidget;
    };
  }, [loadTelegramScript, initializeWidget, onError, onLoad, botName]);

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        '& iframe': {
          border: 'none',
          borderRadius: `${cornerRadius}px`,
        },
      }}
    >
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Loading Telegram login button...
      </Typography>
      <CircularProgress size={24} />
    </Box>
  );
};

export default TelegramLoginButton;
