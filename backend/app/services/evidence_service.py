import os
import json
import logging
import uuid
from datetime import datetime
import httpx
from app.services.blockchain_service import blockchain_service

logger = logging.getLogger(__name__)

class EvidenceService:
    def __init__(self):
        self.pinata_jwt = os.getenv("PINATA_JWT")
        self.pinata_api_key = os.getenv("PINATA_API_KEY")
        self.pinata_api_secret = os.getenv("PINATA_API_SECRET")
        
        self.pinata_upload_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        self.pinata_json_url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
        self.gateway_url = os.getenv("PINATA_GATEWAY_URL", "https://gateway.pinata.cloud/ipfs")
        
        self.client = httpx.AsyncClient(timeout=60.0)
        self.max_file_size = 10 * 1024 * 1024  # 10 MB
        self.allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
        
        self.available = bool(self.pinata_jwt)
        
        if self.available:
            status = "[OK] Evidence service ready (Pinata IPFS)"
            logger.info(status)
            print(status)
        else:
            status = "[FAIL] Evidence service unavailable: missing PINATA_JWT"
            logger.warning(status)
            print(status)

    def is_available(self) -> bool:
        return self.available

    def _get_auth_headers(self) -> dict:
        return {"Authorization": f"Bearer {self.pinata_jwt}"}

    def validate_file(self, filename: str, file_size: int) -> dict:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in self.allowed_extensions:
            return {"valid": False, "error": f"File type {ext} not allowed. Use PDF, JPG, PNG, WEBP"}
        if file_size > self.max_file_size:
            return {"valid": False, "error": "File too large (max 10MB)"}
        return {"valid": True}

    async def upload_to_ipfs(self, file_bytes: bytes, filename: str, description: str = "") -> dict:
        if not self.available:
            return {"success": False, "error": "Evidence service unavailable"}
            
        try:
            files = {"file": (filename, file_bytes)}
            data = {
                "pinataMetadata": json.dumps({
                    "name": filename,
                    "keyvalues": {
                        "description": description,
                        "app": "nyaymitra",
                        "type": "evidence",
                        "uploaded_at": datetime.utcnow().isoformat()
                    }
                }),
                "pinataOptions": json.dumps({"cidVersion": 1})
            }
            
            response = await self.client.post(
                self.pinata_upload_url,
                headers=self._get_auth_headers(),
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                cid = response_data["IpfsHash"]
                return {
                    "success": True,
                    "ipfs_cid": cid,
                    "ipfs_url": f"{self.gateway_url}/{cid}",
                    "filename": filename,
                    "file_size": len(file_bytes),
                    "pin_size": response_data.get("PinSize", 0)
                }
            else:
                return {"success": False, "error": f"Pinata upload failed: {response.status_code} {response.text}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def upload_json_to_ipfs(self, data: dict, name: str = "metadata") -> dict:
        if not self.available:
            return {"success": False, "error": "Evidence service unavailable"}
            
        try:
            payload = {
                "pinataContent": data,
                "pinataMetadata": {
                    "name": name, 
                    "keyvalues": {
                        "app": "nyaymitra", 
                        "type": "evidence_metadata"
                    }
                }
            }
            
            headers = {**self._get_auth_headers(), "Content-Type": "application/json"}
            
            response = await self.client.post(
                self.pinata_json_url,
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                response_data = response.json()
                cid = response_data["IpfsHash"]
                return {
                    "success": True,
                    "ipfs_cid": cid,
                    "ipfs_url": f"{self.gateway_url}/{cid}",
                    "pin_size": response_data.get("PinSize", 0)
                }
            else:
                return {"success": False, "error": f"Pinata JSON upload failed: {response.status_code} {response.text}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def process_evidence(self, files: list[tuple[str, bytes, str]]) -> dict:
        if not self.available:
            return {"success": False, "error": "Evidence service unavailable"}
            
        file_results = []
        errors = []
        
        for filename, file_bytes, description in files:
            validation = self.validate_file(filename, len(file_bytes))
            if not validation["valid"]:
                errors.append({"filename": filename, "error": validation["error"]})
                continue
                
            file_hash = blockchain_service.generate_file_hash(file_bytes)
            ipfs_result = await self.upload_to_ipfs(file_bytes, filename, description)
            
            file_results.append({
                "filename": filename,
                "description": description,
                "sha256_hash": file_hash,
                "ipfs_cid": ipfs_result.get("ipfs_cid", ""),
                "ipfs_url": ipfs_result.get("ipfs_url", ""),
                "ipfs_success": ipfs_result.get("success", False),
                "file_size": len(file_bytes)
            })
            
        metadata = {
            "app": "nyaymitra",
            "type": "evidence_bundle",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "file_count": len(file_results),
            "files": file_results
        }
        
        master_hash = blockchain_service.generate_hash(json.dumps(metadata, sort_keys=True))
        meta_ipfs = await self.upload_json_to_ipfs(metadata, name="evidence_bundle_metadata")
        blockchain_result = await blockchain_service.store_on_chain(master_hash)
        
        return {
            "success": True,
            "evidence_id": str(uuid.uuid4()),
            "timestamp": metadata["timestamp"],
            "files": file_results,
            "errors": errors,
            "master_hash": master_hash,
            "metadata_ipfs_cid": meta_ipfs.get("ipfs_cid", ""),
            "metadata_ipfs_url": meta_ipfs.get("ipfs_url", ""),
            "blockchain": blockchain_result
        }

    async def verify_evidence(self, file_bytes: bytes, expected_hash: str) -> dict:
        computed_hash = blockchain_service.generate_file_hash(file_bytes)
        match = (computed_hash == expected_hash)
        
        return {
            "computed_hash": computed_hash,
            "expected_hash": expected_hash,
            "match": match,
            "integrity": "verified — file is authentic and untampered" if match 
                         else "FAILED — file has been modified or is a different file"
        }

evidence_service = EvidenceService()
