import './App.css'
import { useState, useEffect } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { ethers } from 'ethers'
import { verifyMessage } from '@ambire/signature-validator'


const sdk = new CoinbaseWalletSDK({
    appName: 'Hello Coinbase SmartWallet',
    appChainIds: [11155111],
})
const smartAccount = sdk.makeWeb3Provider({
    options: 'smartWalletOnly'
})


const App = () => {
  const [provider, setProvider] = useState(null)
  const [smartAccountExists, setSmartAccountExists] = useState(false)
  const [address, setAddress] = useState('')
  const [signature, setSignature] = useState('')
  let content
  
  

  const initCoinbaseWalletModal = async () => {
      try {
        const [address] = await smartAccount.request({
            method: 'eth_requestAccounts',
        })
        if (address.length > 0) {
          setAddress(address)
          setSmartAccountExists(true)
          setProvider(new ethers.BrowserProvider(smartAccount))
        }
        return address
      } catch (error) {
        console.error(error)
        if (error.code === 4001) {
          setSmartAccountExists(false)
          setAddress('')
        }
        return []
      }
  }

  const onSignMessage = async () => {
      const signer = await provider.getSigner()
      const signature = await signer.signMessage('Hey Bitch Whats Happenin!')
      console.log(signature)
      setSignature(signature)
  }

  const verify = async () => {
      const isValidSig = await verifyMessage({
          signer: address,
          message: 'Hey Bitch Whats Happenin!',
          signature: signature,
          // this is needed so that smart contract signatures can be verified
          provider,
      })
      console.log('is the sig valid: ', isValidSig)
  }

  // conditionally render
  if (smartAccountExists == false) {
      content = <>
          <div id ="smart-wallet">
              <button onClick={async () => {
                await initCoinbaseWalletModal()
              }}>
                  Coinbase SmartWallet
              </button>
          </div>
          <div id="signatures">
              <span>No Wallets Connected</span>
          </div>
      </>   
  } else {
      content = <>
          <div id="smart-wallet">
              <button onClick={() => {
                  smartAccount.disconnect()
                  setSmartAccountExists(false)
                  setAddress('')
              }}>Reset</button>
          </div>
          <div id="signatures">
              <span>address: {address}</span>
              <div id="sign-bttns">
                  <button onClick={onSignMessage}>Sign</button>
                  <button onClick={verify}>Verify</button>
              </div>
          </div> 
      </>
  }

  
  
  useEffect(() => {
      const init = async () => {
          if (smartAccount.accounts > 0) {
              setSmartAccountExists(true)
              setAddress(smartAccount.accounts[0])
              setProvider(new ethers.BrowserProvider(smartAccount))
          }
      }
      init()
  }, [])


  return (
    <>
        {content}
    </>
  )
}
 

export default App
