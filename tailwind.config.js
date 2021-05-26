const colors = require('tailwindcss/colors');

module.exports = {
	purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			colors: {
				mine: {
					darker: '#26262F',
					dark: '#383848',
					primary: '#EDEDED',
				},
			},
			fontWeight: {
				inherit: 'inherit',
			},
			maxWidth: {
				'10ch': '10ch',
			}
		},
	},
	variants: {
		extend: {
			margin: ['first'],
		},
	},
	plugins: [],
}
