import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

// Based on https://github.com/rollup/rollup-starter-app/blob/master/rollup.config.js

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/index.ts',
	output: {
		file: 'dist/js/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true
	},
	plugins: [
    typescript(),
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts libs to ES modules
		// production && terser() // minify, but only in production
	]
};