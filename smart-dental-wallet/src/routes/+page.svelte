<script lang="ts">
  import { onMount } from 'svelte';
  import { Wallet, keccak256, toUtf8Bytes, concat, getBytes, hexlify, Contract, JsonRpcProvider } from "ethers";
  import ABI from './ABI.json';

  const recipientAddress = '0x86DF4B738D592c31F4A9A657D6c8d6D05DC1D462'; // Replace with the actual recipient address
  const contractCertificateAddress = '0x6847aC7DCbE1f0d87B251e2D3e325898Bee92e08'; // Replace with the actual contract address
  let signingState = $state('preparing'); // preparing, c, signing, sending, success, error
  let currentTime = $state('');
  let userAddress = $state(recipientAddress.toLowerCase());
  let message = $state('');
  let hashMessage = $state('');
  let errorMessage = $state('');
  // RPC Provider and Wallet setup
  const RPC_URL = "http://108.142.237.13:8545";
  const PRIVATE_KEY = "4787c56863d4b0b01b72c4e92e6dfd3b8df05ba2bc30a25bc69b89ad3ee4374f";

  

  
  // Generate current timestamp
  onMount(async () => {
    const now = new Date();
    currentTime = now.toISOString();
    await sendCertificate();
  });
  
  // Certificate data using $derived for reactivity
  let signature = $state('waiting for signature...');
  
  const certificateData = $derived({
    type: 'Login Certificate',
    // timestamp: currentTime,// Current time in seconds
    timestamp: "2025-06-20T16:25:59.700Z", 
    domain: 'smartdental.app',
    nonce: Math.random().toString(36).substring(2, 15),
    chainId: 2020,
    signature: signature
  });

  function serializeCertificateData(data: any) {
        // Ordena siempre los campos
        return [
          `type:${data.type}`,
          `timestamp:${data.timestamp}`,
          `domain:${data.domain}`,
          `nonce:${data.nonce}`,
          `chainId:${data.chainId}`,
          `signature:${data.signature}`
        ].join('|');
      }
  
  async function handleSign() {
    try {
      // Start signing process
      signingState = 'signing';
      
      message = serializeCertificateData(certificateData);
    
      const signature = await signHashAlastria(message)
      
      signingState = 'sending';
      
      // Simulate contract interaction delay
      await sendSignCertificate(signature)
      
      // Success state
      signingState = 'success';
      
      // Reset after 3 seconds
      setTimeout(() => {
        signingState = 'idle';
      }, 3000);
    } catch (error) {
      console.error('Error during signing process:', error);
      signingState = 'error';
      //@ts-ignore
      errorMessage = error.reason || 'Failed to send signed certificate';
      // Reset after 5 seconds
      setTimeout(() => {
        signingState = 'idle';
      }, 5000);
    }
  }

//   function recoverSignerAlastria(messageString, signatureHex) {
//   // 1. Generar el hash del mensaje serializado (igual que certificateHash en Solidity)
//   const certificateHash = keccak256(toUtf8Bytes(messageString));

//   // 2. Construir el mensaje para firmar/verificar (prefijo + hash como bytes)
//   const prefix = "\x19Alastria Signed Message:\n32";
//   const msgForSignature = concat([toUtf8Bytes(prefix), getBytes(certificateHash)]);

//   // 3. Hash final a firmar/verificar
//   const msgForSignatureHash = keccak256(msgForSignature);

//   // 4. Recuperar la address del firmante
//   const recoveredAddress = recoverAddress(msgForSignatureHash, signatureHex);

//   return recoveredAddress;
// }

async function signHashAlastria(certificateMessage: string): Promise<string> {
    const provider = await new JsonRpcProvider(RPC_URL);
      const wallet = await new Wallet(PRIVATE_KEY, provider);
      console.log(`hashMessage`,  hashMessage);
  if(hashMessage == '') {
   
      // 2. Generar el hash del mensaje
      const certificateHash = await keccak256(toUtf8Bytes(certificateMessage)); // bytes32
      hashMessage = certificateHash;

      }
      // 3. Construir el mensaje a firmar con el prefijo personalizado
      const prefix = "\x19Alastria Signed Message:\n32";
      const msgForSignature = await concat([toUtf8Bytes(prefix), getBytes(hashMessage)]);

      // 4. Hash del mensaje final
      const msgForSignatureHash = await keccak256(msgForSignature);
      // 5. Firmar
      const signatureResult = await wallet.signingKey.sign(msgForSignatureHash);

      // 6. Actualizar el estado de la firma
    signature = signatureResult.serialized;

// 7. Obtenemos la firma serializada (0x...)
 return signatureResult.serialized;
}

async function sendSignCertificate(signatureHex: string) {
      const provider = await new JsonRpcProvider(RPC_URL);
  const wallet = await new Wallet(PRIVATE_KEY, provider);
  const contract = await new Contract(contractCertificateAddress, ABI, wallet);
    try {
      const tx = await contract.signCertificate(
            hashMessage,    // bytes32
          signatureHex,       // bytes
          userAddress           // address
      );
      await tx.wait();
      console.log('Certificate signed and sent successfully:', tx);
    } catch (error) {
      console.error('Error sending signed certificate:', error);
      signingState = 'error';
      //@ts-ignore
      errorMessage = error.reason || 'Failed to send signed certificate';
      throw error; // Re-throw to be caught by handleSign
    }
  }

  async function sendCertificate() {
  const provider = await new JsonRpcProvider(RPC_URL);
  const wallet = await new Wallet(PRIVATE_KEY, provider);
  const contract = await new Contract(contractCertificateAddress, ABI, wallet);
    console.log(`userAddress`, userAddress);
    //! no funciona la captura del array directamente
    // const pendingCerts = await contract.getSigningCertificatesFor(userAddress);
    try {
    const pendingCertsByIndex = await contract.pendingCertificatesForUser(userAddress, 0);
    console.log('Pending certificate:', pendingCertsByIndex);
    hashMessage = pendingCertsByIndex
    signingState = 'idle';
    } catch (error) {
      console.error('Error sending  certificate:', error);

       try {
        message = await serializeCertificateData(certificateData);
        await signHashAlastria(message)
      console.log('Creamos este certificado', hashMessage);
      const tx = await contract.issueCertificate(
            hashMessage,    // bytes32
          userAddress,       // bytes
          1           // login
      );
      await tx.wait();
      console.log('Certificate sent successfully:', tx);
      signingState = 'idle';
        
       } catch (error) {
              console.log('error creating certificate:', error);
       }
    }
  }
  
  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
  <div class="max-w-md mx-auto">
    {#if signingState === 'preparing'}
      <!-- Preparing State - Only show this message -->
      <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-900 mb-4">Smart Dental Wallet</h1>
          <div class="flex items-center justify-center space-x-3">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span class="text-gray-700 font-medium">Search certificate or create new certificate</span>
          </div>
        </div>
      </div>
    {:else}
      <!-- Normal UI when not preparing -->
      <!-- Wallet Header -->
      <div class="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Smart Dental Wallet</h1>
              <p class="text-sm text-gray-500">Alastria Network</p>
            </div>
          </div>
          <div class="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
        
        <!-- User Address -->
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-xs text-gray-500 mb-1">Your Address</p>
          <div class="flex items-center justify-between">
            <p class="font-mono text-sm text-gray-900">{formatAddress(userAddress)}</p>
            <button class="text-blue-500 hover:text-blue-600 text-xs">Copy</button>
          </div>
        </div>
      </div>
      
      <!-- Signing Request -->
      <div class="bg-white shadow-lg p-6">
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Signature Request</h2>
          <p class="text-sm text-gray-600">You are about to sign a login certificate</p>
        </div>
        
        <!-- Certificate Details -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-gray-900">{certificateData.type}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Domain:</span>
            <span class="text-sm font-medium text-gray-900">{certificateData.domain}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Timestamp:</span>
            <span class="text-sm font-medium text-gray-900">{new Date(certificateData.timestamp).toLocaleString()}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Chain ID:</span>
            <span class="text-sm font-medium text-gray-900">{certificateData.chainId}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Nonce:</span>
            <span class="text-sm font-medium text-gray-900 font-mono">{certificateData.nonce}</span>
          </div>
        </div>
        
        <!-- Message to Sign -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 class="text-sm font-medium text-yellow-800 mb-2">Message to Sign:</h3>
          <div class="text-xs font-mono text-yellow-700 bg-yellow-100 p-3 rounded border">
            {`Smart Dental Login Certificate\n\nDomain: ${certificateData.domain}\nTimestamp: ${certificateData.timestamp}\nNonce: ${certificateData.nonce}\nChain ID: ${certificateData.chainId}`}
          </div>
        </div>
      </div>
      
      <!-- Action Button -->
      <div class="bg-white rounded-b-2xl shadow-lg p-6">
        {#if signingState === 'idle'}
          <button 
            onclick={handleSign}
            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Sign Certificate
          </button>
        {:else if signingState === 'signing'}
          <div class="w-full bg-orange-500 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Signing...</span>
          </div>
        {:else if signingState === 'sending'}
          <div class="w-full bg-purple-500 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span>Sending to Smart Contract...</span>
          </div>
        {:else if signingState === 'success'}
          <div class="w-full bg-green-500 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3">
            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Signature & Send Successful!</span>
          </div>
        {:else if signingState === 'error'}
          <div class="w-full bg-red-500 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3">
            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Error: Failed to Sign</span>
          </div>
          <div>{errorMessage}</div>
        {/if}
        
        <!-- Transaction Details (shown during/after signing) -->
        {#if signingState !== 'idle'}
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Gas Fee:</span>
              <span class="text-gray-900">~Free</span>
            </div>
            <div class="flex items-center justify-between text-sm mt-2">
              <span class="text-gray-500">Network:</span>
              <span class="text-gray-900">Alastria Network</span>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-xs text-gray-500">
          Powered by Smart Dental Protocol
        </p>
      </div>
    {/if}
  </div>
</div>


<style>
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0,-30px,0);
    }
    70% {
      transform: translate3d(0,-15px,0);
    }
    90% {
      transform: translate3d(0,-4px,0);
    }
  }
</style>
