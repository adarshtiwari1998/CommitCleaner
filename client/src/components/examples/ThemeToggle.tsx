import { ThemeProvider } from '../ThemeProvider';
import { ThemeToggle } from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-6">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}