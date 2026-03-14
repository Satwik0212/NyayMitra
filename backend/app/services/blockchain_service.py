import os
import logging
import hashlib
from datetime import datetime
from web3 import Web3
from web3.exceptions import ContractLogicError

logger = logging.getLogger(__name__)

CONTRACT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "documentHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "submittedBy", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "ProofStored",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
        "name": "getProof",
        "outputs": [
            {"internalType": "bytes32", "name": "", "type": "bytes32"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "proofs",
        "outputs": [
            {"internalType": "bytes32", "name": "documentHash", "type": "bytes32"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "address", "name": "submittedBy", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "_documentHash", "type": "bytes32"}],
        "name": "storeProof",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

class BlockchainService:
    def __init__(self):
        self.available = False
        
        rpc_url = os.getenv("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology/")
        private_key = os.getenv("WALLET_PRIVATE_KEY")
        contract_address = os.getenv("CONTRACT_ADDRESS", "0xfE0ED936D92AA844A06B8a4279330FE747f55420")
        chain_id = os.getenv("NETWORK_CHAIN_ID", "80002")
        
        if not private_key:
            logger.error("[FAIL] Blockchain unavailable: Missing WALLET_PRIVATE_KEY")
            print("[FAIL] Blockchain unavailable: Missing WALLET_PRIVATE_KEY")
            return
            
        try:
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
            if not self.w3.is_connected():
                logger.error("[FAIL] Blockchain unavailable: Cannot connect to RPC provider")
                print("[FAIL] Blockchain unavailable: Cannot connect to RPC provider")
                return
                
            self.account = self.w3.eth.account.from_key(private_key)
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(contract_address), 
                abi=CONTRACT_ABI
            )
            self.chain_id = int(chain_id)
            self.available = True
            
            status = f"[OK] Blockchain connected | Wallet: {self.account.address} | Contract: {contract_address}"
            logger.info(status)
            print(status)
            
        except Exception as e:
            error_msg = f"[FAIL] Blockchain unavailable: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            self.available = False

    def is_available(self) -> bool:
        return self.available

    def generate_hash(self, data: str) -> str:
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

    def generate_file_hash(self, file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    async def store_on_chain(self, hash_hex: str) -> dict:
        if not self.available:
            return {"success": False, "error": "service_unavailable", "message": "Blockchain service is not available"}
            
        try:
            if len(hash_hex) != 64:
                return {"success": False, "error": "invalid_hash", "message": "Hash must be exactly 64 characters (32 bytes)"}
                
            hash_bytes = bytes.fromhex(hash_hex)
            
            tx = self.contract.functions.storeProof(hash_bytes).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 200000,
                'gasPrice': self.w3.to_wei('30', 'gwei'),
                'chainId': self.chain_id
            })
            
            signed = self.w3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash_bytes = self.w3.eth.send_raw_transaction(signed.raw_transaction)
            
            # Using synchronous wait_for_transaction_receipt since web3.py async can be tricky to set up simply
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=120)
            
            tx_hash_hex = "0x" + receipt.transactionHash.hex()
            
            if receipt.status == 1:
                return {
                    "success": True,
                    "tx_hash": tx_hash_hex,
                    "block_number": receipt.blockNumber,
                    "gas_used": receipt.gasUsed,
                    "polygonscan_url": f"https://amoy.polygonscan.com/tx/{tx_hash_hex}"
                }
            else:
                return {"success": False, "error": "transaction_reverted", "message": "Transaction reverted by EVM"}
                
        except Exception as e:
            error_str = str(e).lower()
            if "insufficient funds" in error_str or "insufficient balance" in error_str:
                return {
                    "success": False, 
                    "error": "insufficient_balance", 
                    "message": "Wallet does not have enough MATIC for gas fees. Get test MATIC from https://faucet.polygon.technology/"
                }
            elif "timeout" in error_str:
                return {
                    "success": False, 
                    "error": "timeout", 
                    "message": "Blockchain transaction timed out. Network may be congested. Try again."
                }
            elif "nonce" in error_str:
                return {
                    "success": False, 
                    "error": "nonce_error",
                    "message": "Transaction nonce conflict. Please try again in a few seconds."
                }
            return {"success": False, "error": "transaction_failed", "message": str(e)}

    async def verify_transaction(self, tx_hash: str) -> dict:
        if not self.available:
            return {"verified": False, "error": "Blockchain service is not available"}
            
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return {
                "verified": True,
                "block_number": receipt.blockNumber,
                "gas_used": receipt.gasUsed,
                "status": "confirmed" if receipt.status == 1 else "failed",
                "polygonscan_url": f"https://amoy.polygonscan.com/tx/{tx_hash}"
            }
        except Exception as e:
            if "not found" in str(e).lower():
                return {"verified": False, "error": "Transaction not found on Polygon Amoy"}
            return {"verified": False, "error": str(e)}

    async def get_proof(self, index: int) -> dict:
        if not self.available:
            return {"error": "Blockchain service is not available"}
            
        try:
            result = self.contract.functions.getProof(index).call()
            return {
                "document_hash": "0x" + result[0].hex(),
                "timestamp": result[1],
                "submitted_by": result[2],
                "datetime": datetime.utcfromtimestamp(result[1]).isoformat() + "Z"
            }
        except Exception as e:
            return {"error": str(e)}

    def get_wallet_balance(self) -> dict:
        if not self.available:
            return {"error": "Blockchain service is not available"}
            
        try:
            balance_wei = self.w3.eth.get_balance(self.account.address)
            balance_matic = self.w3.from_wei(balance_wei, 'ether')
            return {
                "address": self.account.address,
                "balance_matic": str(balance_matic),
                "balance_wei": balance_wei,
                "sufficient": float(balance_matic) > 0.001,
                "network": "Polygon Amoy Testnet",
                "chain_id": self.chain_id
            }
        except Exception as e:
            return {"error": str(e)}

blockchain_service = BlockchainService()
