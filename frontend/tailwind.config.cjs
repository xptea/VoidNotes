
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.white / 90'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.blue.400'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-quotes': theme('colors.white / 90'),
            '--tw-prose-code': theme('colors.white'),
            '--tw-prose-hr': theme('colors.white / 20'),
            '--tw-prose-th-borders': theme('colors.white / 20'),
            '--tw-prose-td-borders': theme('colors.white / 10'),
            'H1': {
              marginTop: '0.1em',

              marginBottom: '1rem',
            },
            'H2': {
              marginTop: '0.1em',

              marginBottom: '1rem',
            },
            'H3': {
              marginTop: '0.1em',

              marginBottom: '1rem',
            },
            'p': {
              marginTop: '0.1em',
              marginBottom: '0.1em',
            },
            'table': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            },
            'th': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.75rem',
            },
            'td': {
              padding: '0.75rem',
            },
            'ul[data-type="taskList"]': {
              listStyle: 'none',
              padding: 0,
            },
            'ul[data-type="taskList"] li': {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            },
            'ul[data-type="taskList"] input[type="checkbox"]': {
              width: '1rem',
              height: '1rem',
              borderRadius: '0.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            'blockquote': {
              borderLeftColor: theme('colors.blue.500'),
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.25rem',
            },
            'img': {
              borderRadius: '0.5rem',
              maxHeight: '20rem',
              objectFit: 'contain',
            },
            'hr': {
              margin: '2rem 0',
            }
          }
        }
      })
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
