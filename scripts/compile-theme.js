import fs from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';

function findPackageDir(pkgName) {
	const directPath = path.resolve('node_modules', pkgName);
	if (fs.existsSync(directPath)) return directPath;
	const pnpmDir = path.resolve('node_modules/.pnpm');
	if (fs.existsSync(pnpmDir)) {
		const entries = fs.readdirSync(pnpmDir);
		const escaped = pkgName.replace('/', '+');
		const match = entries.find((e) => e.startsWith(escaped));
		if (match) {
			return path.resolve(pnpmDir, match, 'node_modules', pkgName);
		}
	}
	throw new Error(`Package ${pkgName} not found in node_modules or .pnpm`);
}

const smuiThemePkg = findPackageDir('smui-theme');
const smuiCommonPkg = findPackageDir('@smui/common');

function compile(themeInclude, output) {
	const result = sass.compile(path.resolve(smuiThemePkg, '_index.scss'), {
		importers: [new sass.NodePackageImporter(process.cwd())],
		loadPaths: [
			path.resolve(themeInclude),
			path.resolve(smuiCommonPkg, '..', '..'),
			path.resolve(smuiThemePkg, 'fallback')
		],
		style: 'compressed',
		silenceDeprecations: [
			'if-function',
			'color-functions',
			'import',
			'global-builtin'
		]
	});
	fs.writeFileSync(output, result.css);
}

compile('src/theme', 'static/smui.css');
compile('src/theme/dark', 'static/smui-dark.css');
