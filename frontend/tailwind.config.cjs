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
            },
            'pre': {
              backgroundColor: 'rgba(25, 25, 25, 0.95)',
              color: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '0.5rem',
              overflow: 'auto',
              padding: '1rem',
              margin: '1rem 0',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: 0,
              color: 'inherit',
              fontSize: '0.9em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              whiteSpace: 'pre',
            },
            'code': {
              backgroundColor: 'rgba(30, 30, 30, 0.5)',
              color: 'rgba(255, 255, 255, 0.9)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.9em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
            '.code-block': {
              backgroundColor: 'rgba(25, 25, 25, 0.95) !important',
              borderRadius: '0.5rem !important',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important',
              fontSize: '0.9em !important',
            },
            '.hljs': {
              backgroundColor: 'transparent !important',
              color: 'rgba(255, 255, 255, 0.9) !important',
            },
            '.hljs-keyword': { color: '#ff79c6' },
            '.hljs-operator': { color: '#ff79c6' },
            '.hljs-punctuation': { color: '#fff' },
            '.hljs-title': { color: '#50fa7b' },
            '.hljs-params': { color: '#f8f8f2' },
            '.hljs-string': { color: '#f1fa8c' },
            '.hljs-number': { color: '#bd93f9' },
            '.hljs-comment': { color: '#6272a4' },
            '.hljs-function': { color: '#50fa7b' },
            '.hljs-class': { color: '#50fa7b' },
            '.hljs-built_in': { color: '#8be9fd' },
            '.hljs-property': { color: '#66d9ef' },
            '.hljs-attr': { color: '#50fa7b' },
            '.hljs-name': { color: '#50fa7b' },
            '.hljs-tag': { color: '#ff79c6' },
            '.hljs-attribute': { color: '#50fa7b' },
            '.hljs-subst': { color: '#f8f8f2' },
            // Ensure all spaces are transparent
            '.hljs-whitespace': { backgroundColor: 'transparent !important' },
            '.hljs .whitespace': { backgroundColor: 'transparent !important' },
          }
        }
      })
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
