/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'animal': 'red',
        'plant': 'green',
      },
      boxShadow: {
        'animal': '0 0 10px rgba(255, 0, 0, 0.5)',
        'plant': '0 0 10px rgba(0, 255, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
