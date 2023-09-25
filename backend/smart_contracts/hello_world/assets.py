from algosdk import algod, transaction

# Initialize the algod client
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"  # Replace with your Algorand node's token
algod_address = "<http://localhost:4001>"  # Replace with your Algorand node's address
algod_client = algod.AlgodClient(algod_token, algod_address)

# Account 1 creates an asset called `INR` with a total supply
# of 1000 units and sets itself to the freeze/clawback/manager/reserve roles
acct1_address = "HXBAML5MM3DQJTB7KEVHDXQHYTQELNE7EFJPZ2JJIOYNM4C2WXVEZX54CE"  # Replace with your Account 1's address
acct1_private_key = "AuexcYQ0dIMzinE6blZsezTXYAJGlFoT9rfsfMmkpHo9wgYvrGbHBMw/USpx3gfE4EW0nyFS/OkpQ7DWcFq16g=="  # Replace with your Account 1's private key

sp = algod_client.suggested_params()
txn = transaction.AssetConfigTxn (
    sender="HXBAML5MM3DQJTB7KEVHDXQHYTQELNE7EFJPZ2JJIOYNM4C2WXVEZX54CE",
    sp=sp,
    total=1000000,
    default_frozen=False,
    unit_name="INR",
    asset_name="Indian Rupee",
    manager="HXBAML5MM3DQJTB7KEVHDXQHYTQELNE7EFJPZ2JJIOYNM4C2WXVEZX54CE",
    reserve="HXBAML5MM3DQJTB7KEVHDXQHYTQELNE7EFJPZ2JJIOYNM4C2WXVEZX54CE",
    freeze="HXBAML5MM3DQJTB7KEVHDXQHYTQELNE7EFJPZ2JJIOYNM4C2WXVEZX54CE",
    clawback="HXBAML5MM3DQJTB7KEVHDXQHYTQELNE7EFJPZ2JJIOYNM4C2WXVEZX54CE",
    url="https://www.xe.com/currency/inr-indian-rupee/",  # Removed '<' and '>' around the URL
    decimals=0,
)

# Sign the transaction
signed_txn = txn.sign(acct1_private_key)

# Send the transaction
txid = algod_client.send_transaction(signed_txn)
print(f"Sent asset creation transaction with txid: {txid}")

# Wait for the transaction to be confirmed
results = transaction.wait_for_confirmation(algod_client, txid, 4)
print(f"Result confirmed in round: {results['confirmed-round']}")

# Get the asset ID
created_asset = results['asset-index']
print(f"Asset ID: {created_asset}")

# Create transfer transaction
acct2_address = "KJHVZD4JBLFARKSPIBLD3EFZIR37WIOGSS346PNL2XEHH6ZRUN7C35527U"  # Replace with your Account 2's address
xfer_txn = transaction.AssetTransferTxn(
    sender=acct1_address,
    sp=sp,
    receiver=acct2_address,
    amt=1,
    index=created_asset,
)

# Sign the transaction
signed_xfer_txn = xfer_txn.sign(acct1_private_key)

# Send the transaction
txid = algod_client.send_transaction(signed_xfer_txn)
print(f"Sent transfer transaction with txid: {txid}")

# Wait for the transaction to be confirmed
results = transaction.wait_for_confirmation(algod_client, txid, 4)
print(f"Result confirmed in round: {results['confirmed-round']}")
