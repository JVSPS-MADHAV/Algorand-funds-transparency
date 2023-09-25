import { useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

// Define the asset ID for the custom INR asset
const assetId = 377032762 // Replace with the actual asset ID

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Transact = ({ openModal, setModalState }: TransactInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [transferAmount, setTransferAmount] = useState<number>(0) // Initialize with 0

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algodClient = new algosdk.Algodv2(algodConfig.token, algodConfig.server, algodConfig.port)

  const { enqueueSnackbar } = useSnackbar()

  const { signer, activeAddress, signTransactions, sendTransactions } = useWallet()

  const handleSubmitINRTransfer = async () => {
    setLoading(true)

    if (!signer || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }

    if (transferAmount <= 0) {
      enqueueSnackbar('Please enter a valid transfer amount', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Create an asset transfer transaction for INR with the desired amount
      const transaction = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: receiverAddress,
        assetIndex: assetId, // Use the custom asset ID for INR
        amount: transferAmount, // Specify the amount of INR to transfer
        suggestedParams,
      })

      const encodedTransaction = algosdk.encodeUnsignedTransaction(transaction)

      const signedTransactions = await signTransactions([encodedTransaction])

      const waitRoundsToConfirm = 4

      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const { txId } = await sendTransactions(signedTransactions, waitRoundsToConfirm)
      enqueueSnackbar(`Transaction sent: ${txId}`, { variant: 'success' })
      setReceiverAddress('')
      setTransferAmount(0) // Reset the transfer amount after a successful transfer
    } catch (error) {
      console.error('Transaction failed:', error)
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog id="transact_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Send INR Payment Transaction</h3>
        <br />
        <input
          type="text"
          data-test-id="receiver-address"
          placeholder="Provide recipient's wallet address"
          className="input input-bordered w-full"
          value={receiverAddress}
          onChange={(e) => {
            setReceiverAddress(e.target.value)
          }}
        />
        <input
          type="number"
          data-test-id="transfer-amount"
          placeholder="Enter transfer amount (INR)"
          className="input input-bordered w-full"
          value={transferAmount}
          onChange={(e) => {
            setTransferAmount(parseFloat(e.target.value) || 0) // Ensure it's a valid number
          }}
        />
        <div className="modal-action ">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          <button
            data-test-id="send-inr"
            className={`btn ${receiverAddress.length === 58 && transferAmount > 0 ? '' : 'btn-disabled'} lo`}
            onClick={handleSubmitINRTransfer}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Send INR'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default Transact
