import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import './ui/styles.css';

// Canvas textures draw letters with this font, so load it before the scene is built.
document.fonts
  .load('600 76px "IBM Plex Sans"')
  .catch(() => undefined)
  .then(() => createRoot(document.getElementById('root')!).render(<App />));
