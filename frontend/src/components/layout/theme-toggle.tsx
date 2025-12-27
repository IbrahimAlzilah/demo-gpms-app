import { useThemeStore } from '@/stores/theme.store'
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui";

export function ModeToggle() {
  const { theme, setTheme } = useThemeStore()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <Button
        variant='secondary'
        size='icon'
        className='size-9 relative border border-input hover:bg-accent hover:text-accent-foreground'
        onClick={toggleTheme}
      >
        <Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
        <Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
        <span className='sr-only'>Toggle theme</span>
      </Button>
    </>
  );
}
