import {defineConfig,loadEnv,type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {copyFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const releaseAssets:Plugin={name:'release-assets',apply:'build',configResolved(config){thisOut=resolve(config.root,config.build.outDir);},async writeBundle(){await mkdir(thisOut,{recursive:true});await Promise.all(['icon.svg','manifest.json','sw.js'].map(name=>copyFile(resolve('public',name),resolve(thisOut,name))));}};
let thisOut=resolve('dist');
export default defineConfig(({mode})=>({base:loadEnv(mode,process.cwd(),'VITE_').VITE_BASE_PATH||'./',plugins:[react(),releaseAssets],server:{port:5179,strictPort:true,watch:{ignored:['**/.tools/**','**/test-results/**','**/backups/**','**/runtime/**']},proxy:{'/api':'http://127.0.0.1:3179'}},preview:{port:4179,strictPort:true},build:{copyPublicDir:false,rollupOptions:{output:{manualChunks:{phaser:['phaser']}}}}}));
