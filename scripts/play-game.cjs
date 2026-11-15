/* Dependency-free production launcher. Ships only public dist assets on loopback. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const gameDir=path.resolve(__dirname,'..'),logPath=path.join(gameDir,'launcher.log');
const log=(...parts)=>{const msg=parts.map(String).join(' ');console.log(msg);try{fs.appendFileSync(logPath,new Date().toISOString()+' '+msg+'\r\n');}catch{}};
process.on('uncaughtException',err=>{log('LOI:',err.stack||err.message);process.exitCode=1;});
const root=path.resolve(__dirname,'../dist'),port=Number(process.env.PHO_MINH_PORT||4179),host='127.0.0.1';
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('PHO_MINH_PORT must be 1024..65535');
if(!fs.existsSync(path.join(root,'index.html')))throw Error('Missing dist/index.html. Extract the whole game zip first.');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const url=`http://localhost:${port}`;
const open=()=>{
 log(`Phố Mình: ${url}/\nCtrl+C để dừng game.`);
 if(process.argv.includes('--open')&&!process.env.PHO_MINH_NO_OPEN){
  // ShellExecute through PowerShell avoids cmd/start's empty-title quoting edge cases.
  const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',`$ErrorActionPreference='Stop'; Start-Process -FilePath '${url}/'`],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  let error='';child.stderr.on('data',d=>error+=d);child.on('error',e=>log('Không mở được trình duyệt:',e.message,'Hãy mở link phía trên.'));
  child.on('exit',code=>log(code===0?'Đã gửi yêu cầu mở trình duyệt.':`Không mở được trình duyệt (${code}): ${error}. Hãy mở link phía trên.`));
 }
};
const server=http.createServer((req,res)=>{try{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname==='/__pho_minh'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({game:'pho-minh',version:'official-chibi-v4'}));}
 if(pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Local guest build: no cloud API configured'}));}
 const file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 const target=pathname==='/'?path.join(root,'index.html'):file;
 if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':pathname.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache'});if(req.method==='HEAD')return res.end();fs.createReadStream(target).pipe(res);
 }catch{res.writeHead(400);res.end('Bad request');}});
const verifyExisting=()=>http.get(`http://${host}:${port}/`,r=>{let html='';r.on('data',d=>html+=d);r.on('end',()=>{if(html===fs.readFileSync(path.join(root,'index.html'),'utf8'))open();else{log(`Port ${port} đang bận. Đóng server cũ hoặc đặt PHO_MINH_PORT.`);process.exitCode=1;}});}).on('error',()=>{log(`Port ${port} đang bận.`);process.exitCode=1;});
server.on('error',err=>{if(err.code==='EADDRINUSE'){http.get(`http://${host}:${port}/__pho_minh`,r=>{let data='';r.on('data',d=>data+=d);r.on('end',()=>{try{if(JSON.parse(data).game==='pho-minh'){open();return;}}catch{}verifyExisting();});}).on('error',verifyExisting);}else{log(err.message);process.exitCode=1;}});
server.listen(port,host,open);
