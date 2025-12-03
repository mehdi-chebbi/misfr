// Google API Type Definitions
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with';
            shape?: 'rectangular' | 'pill' | 'square' | 'circle';
            logo_alignment?: 'left' | 'center' | 'right';
            width?: string | number;
            locale?: string;
            click_listener?: () => void;
          }) => void;
        };
      };
    };
  }
}

export {};