// Import globals.css for Tailwind styles
import '../src/app/globals.css';

// Preview configuration
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;