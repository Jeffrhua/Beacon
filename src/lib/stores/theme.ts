import { browser } from '$app/environment';
import { writable } from 'svelte/store';


function createThemeStore() {
  const { subscribe, set, update } = writable(
    browser ? localStorage.getItem("theme") || 'light' : 'light'
  );

  return {
    subscribe,
    set: (value) => {
      if (browser) {
        localStorage.setItem("theme", value);
      }
      set(value);
    },
    toggle: () => {
      update(current => {
        const newTheme = current === 'dark' ? 'light' : 'dark';
        if (browser) {
          localStorage.setItem("theme", newTheme);
        }
        return newTheme;
      });
    }
  };
}

export const theme = createThemeStore();