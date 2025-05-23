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
        'organism': 'red',
        'nutrience': 'green',
      },
      boxShadow: {
        'organism': '0 0 10px rgba(255, 0, 0, 0.5)',
        'nutrience': '0 0 10px rgba(0, 255, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
