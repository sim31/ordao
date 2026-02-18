# Backup RPC functionality

I'm running ornode locally (`npm run dev-of2:ornode`) and gui locally (`npm run dev-of2:gui`). The GUI is not loading - the spinner just keeps spinning. This is the error I get in the console:

```
Access to fetch at 'https://1rpc.io/op' from origin 'http://localhost:5175' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
geturl-browser.ts:48  POST https://1rpc.io/op net::ERR_FAILED 200 (OK)
getUrl2 @ geturl-browser.ts:48
send_fn @ fetch.ts:539
send @ fetch.ts:594
_send @ provider-jsonrpc.ts:1271
(anonymous) @ provider-jsonrpc.ts:545
(anonymous) @ provider-jsonrpc.ts:587
setTimeout
scheduleDrain_fn @ provider-jsonrpc.ts:518
(anonymous) @ provider-jsonrpc.ts:782
await in (anonymous)
_start @ provider-jsonrpc.ts:783
send @ provider-jsonrpc.ts:1261
_perform @ provider-jsonrpc.ts:682
call_fn @ abstract-provider.ts:985
call @ abstract-provider.ts:1056
await in call
staticCallResult @ contract.ts:337
await in staticCallResult
staticCall @ contract.ts:303
respectContract @ contract.ts:351
getOldRespectAddr @ orContext.js:146
validate @ orContext.js:43
create @ orContext.js:104
await in create
createOrclientReader @ createOrclient.js:190
createReader @ useOrclient.js:21
createBackup @ useOrclient.js:56
installHook.js:1 TypeError: Failed to fetch
    at _FetchRequest.getUrl2 (geturl-browser.ts:48:26)
    at _FetchRequest.send_fn (fetch.ts:539:33)
    at _FetchRequest.send (fetch.ts:594:16)
    at JsonRpcProvider._send (provider-jsonrpc.ts:1271:40)
    at provider-jsonrpc.ts:545:51
    at provider-jsonrpc.ts:587:17
overrideMethod @ installHook.js:1
(anonymous) @ useOrclient.js:59
Promise.then
createBackup @ useOrclient.js:56
```

Now I could just change the RPC URL in [config](../../../apps/gui/src/global/config.ts) to the public RPC that is currently working. But as you can see that config option accepts an array of RPC URLs. I want to use it to create a more robust solution where the app would switch to a different RPC if the current one is not working.