/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        android: {
          green: '#3DDC84',
          dark: '#073042',
          light: '#E8F5E9',
          accent: '#2EA44F',
        },
      },
    },
  },
  plugins: [],
};
