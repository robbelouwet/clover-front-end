import { secp256k1, to_secp256k1_point, Point } from "./ecdsa";
import { Signature, Transaction, ethers, InfuraProvider, Wallet } from "ethers";
import * as arith from "bigint-mod-arith";
import * as paillierBigint from "paillier-bigint";
import { rnd256 } from "./ecdsa"

/*
API transaction hash serialization: 

ethers.js, Transaction::unsignedHash :
Hashes this DynamicFeeTransaction to prepare it for signing.
As per the EIP-1559 specifications, the signature is a secp256k1 signature over
keccak256(0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to,
value, data, accessList])). Here, we compute the keccak256(...) hash.
*/
export const exchange_signature = async (client_sk: bigint, tx: Transaction) => {

	console.log("unsigned tx hash: ", tx.unsignedHash)

	// ----- PART 1: Key Exchange -----
	const client_k2 = rnd256()
	const client_R = secp256k1.multiply(client_k2)
	const keys = await key_exchange(client_R, tx)

	// ----- PART 2: PARTIAL SIG -----
	const { r, s, v } = await push_partial_signature(client_sk, keys, client_k2, tx)

	console.log("r: ", r)
	console.log("s: ", s)
	console.log("v: ", v)

	// ----- PART 3: Send transaction -----
	sendTransaction(tx, r, s, v)

};

const key_exchange = async (client_R: Point, tx: Transaction): Promise<any> => {
	// R2
	const str_x_R2 = "0x" + client_R.__x__.toString(16);
	const str_y_R2 = "0x" + client_R.__y__.toString(16);

	const _body = tx.unsignedSerialized.toString()
	console.log("req body init-kex: ", _body)

	const _headers: any = {
		"Content-Type": "application/json",
	}

	if (process.env.NODE_ENV !== "production") {
		_headers["x-ms-client-principal"] = "eyJhdXRoX3R5cCI6Imdvb2dsZSIsImNsYWltcyI6W3sidHlwIjoiaXNzIiwidmFsIjoiaHR0cHM6XC9cL2FjY291bnRzLmdvb2dsZS5jb20ifSx7InR5cCI6ImF6cCIsInZhbCI6Ijg0NDIwNTI3ODMzMy1qdTg5N3JzcGx1bzNvanA4YmRmb2NzdHFlYWNvcjU3NC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSJ9LHsidHlwIjoiYXVkIiwidmFsIjoiODQ0MjA1Mjc4MzMzLWp1ODk3cnNwbHVvM29qcDhiZGZvY3N0cWVhY29yNTc0LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL25hbWVpZGVudGlmaWVyIiwidmFsIjoiMTE3MzM5NzY3OTcxNTk0MDcxMDQyIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2VtYWlsYWRkcmVzcyIsInZhbCI6InJvYmJlbG91d2V0QGdtYWlsLmNvbSJ9LHsidHlwIjoiZW1haWxfdmVyaWZpZWQiLCJ2YWwiOiJ0cnVlIn0seyJ0eXAiOiJhdF9oYXNoIiwidmFsIjoia2xxSzZ4NGNteFVJSmdlTUYtLS1mdyJ9LHsidHlwIjoibmFtZSIsInZhbCI6IlJvYmJlIExvdXdldCJ9LHsidHlwIjoicGljdHVyZSIsInZhbCI6Imh0dHBzOlwvXC9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXC9hXC9BR05teXhZbWh6U2xhUktqWlJfQnpKUHY2SnNkVUVneTFtVkxTTGlyX2ViSXp3PXM5Ni1jIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2dpdmVubmFtZSIsInZhbCI6IlJvYmJlIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL3N1cm5hbWUiLCJ2YWwiOiJMb3V3ZXQifSx7InR5cCI6ImxvY2FsZSIsInZhbCI6Im5sIn0seyJ0eXAiOiJpYXQiLCJ2YWwiOiIxNjgxNDU0MzI5In0seyJ0eXAiOiJleHAiLCJ2YWwiOiIxNjgxNDU3OTI5In1dLCJuYW1lX3R5cCI6Imh0dHA6XC9cL3NjaGVtYXMueG1sc29hcC5vcmdcL3dzXC8yMDA1XC8wNVwvaWRlbnRpdHlcL2NsYWltc1wvZW1haWxhZGRyZXNzIiwicm9sZV90eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL3dzXC8yMDA4XC8wNlwvaWRlbnRpdHlcL2NsYWltc1wvcm9sZSJ9"
	}

	// Key Exchange
	return await fetch(
		`${process.env.REACT_APP_CLOVER_BACKEND}/api/initiate-kex?x=${str_x_R2}&y=${str_y_R2}&code=2C80YgacJFX8pXYxdentxCf6XL_X6ZXk3b_P37Q3o0m2AzFumFDT9A==`,
		{
			method: "PUT",
			credentials: process.env.NODE_ENV === 'production' ? 'include' : 'omit',
			headers: _headers,
			body: _body,
		}
	).then((resp) => resp.json())
}

const push_partial_signature = async (client_sk: bigint, keys: any, client_k2: bigint, tx: Transaction): Promise<any> => {

	// client_k2 inverse
	const client_k2_inv = arith.modInv(client_k2, secp256k1.__n__);

	// R (to calculate s')
	const client_R = secp256k1.multiply(client_k2)
	const R = to_secp256k1_point(
		BigInt(keys["R_server"]["x"]),
		BigInt(keys["R_server"]["y"])
	).multiply(client_k2);

	// Parse paillier public key
	const rho = rnd256()
	const paillier_pk = new paillierBigint.PublicKey(
		BigInt(keys["paillier_pk"]),

		// g = n + 1 in our python-paillier backend
		BigInt(keys["paillier_pk"]) + 1n
	);

	// Partial signature s'
	const s_accent = paillier_pk.addition(
		paillier_pk.multiply(
			BigInt(keys["paillier_server_x"]),
			arith.modPow(client_k2_inv * R.__x__ * client_sk, 1, secp256k1.__n__)
		), paillier_pk.encrypt(arith.modPow(client_k2_inv * BigInt(tx.unsignedHash), 1, secp256k1.__n__)
		), paillier_pk.encrypt(secp256k1.__n__ * rho))

	console.log("SERVER KEYS RESPONSE:", keys)

	const _headers: any = {
		"Content-Type": "application/json",
	}

	if (process.env.NODE_ENV !== "production") {
		_headers["x-ms-client-principal"] = "eyJhdXRoX3R5cCI6Imdvb2dsZSIsImNsYWltcyI6W3sidHlwIjoiaXNzIiwidmFsIjoiaHR0cHM6XC9cL2FjY291bnRzLmdvb2dsZS5jb20ifSx7InR5cCI6ImF6cCIsInZhbCI6Ijg0NDIwNTI3ODMzMy1qdTg5N3JzcGx1bzNvanA4YmRmb2NzdHFlYWNvcjU3NC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSJ9LHsidHlwIjoiYXVkIiwidmFsIjoiODQ0MjA1Mjc4MzMzLWp1ODk3cnNwbHVvM29qcDhiZGZvY3N0cWVhY29yNTc0LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL25hbWVpZGVudGlmaWVyIiwidmFsIjoiMTE3MzM5NzY3OTcxNTk0MDcxMDQyIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2VtYWlsYWRkcmVzcyIsInZhbCI6InJvYmJlbG91d2V0QGdtYWlsLmNvbSJ9LHsidHlwIjoiZW1haWxfdmVyaWZpZWQiLCJ2YWwiOiJ0cnVlIn0seyJ0eXAiOiJhdF9oYXNoIiwidmFsIjoia2xxSzZ4NGNteFVJSmdlTUYtLS1mdyJ9LHsidHlwIjoibmFtZSIsInZhbCI6IlJvYmJlIExvdXdldCJ9LHsidHlwIjoicGljdHVyZSIsInZhbCI6Imh0dHBzOlwvXC9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXC9hXC9BR05teXhZbWh6U2xhUktqWlJfQnpKUHY2SnNkVUVneTFtVkxTTGlyX2ViSXp3PXM5Ni1jIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2dpdmVubmFtZSIsInZhbCI6IlJvYmJlIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL3N1cm5hbWUiLCJ2YWwiOiJMb3V3ZXQifSx7InR5cCI6ImxvY2FsZSIsInZhbCI6Im5sIn0seyJ0eXAiOiJpYXQiLCJ2YWwiOiIxNjgxNDU0MzI5In0seyJ0eXAiOiJleHAiLCJ2YWwiOiIxNjgxNDU3OTI5In1dLCJuYW1lX3R5cCI6Imh0dHA6XC9cL3NjaGVtYXMueG1sc29hcC5vcmdcL3dzXC8yMDA1XC8wNVwvaWRlbnRpdHlcL2NsYWltc1wvZW1haWxhZGRyZXNzIiwicm9sZV90eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL3dzXC8yMDA4XC8wNlwvaWRlbnRpdHlcL2NsYWltc1wvcm9sZSJ9"
	}

	// Push the transaction and partial signature, receive the full signature pair (r, s, v)
	return await fetch(
		`${process.env.REACT_APP_CLOVER_BACKEND}/api/push-sig?code=2C80YgacJFX8pXYxdentxCf6XL_X6ZXk3b_P37Q3o0m2AzFumFDT9A==`,
		{
			method: "PUT",
			credentials: process.env.NODE_ENV === 'production' ? 'include' : 'omit',
			headers: _headers,
			body: JSON.stringify({
				tx: tx.unsignedSerialized,
				R_client: {
					x: client_R.__x__.toString(16),
					y: client_R.__y__.toString(16)
				},
				paillier_server_k: keys["paillier_server_k"],
				// paillier_server_k: {
				// 	value: keys["paillier_server_k"]["value"],
				// 	hmac: (BigInt("0x" + keys["paillier_server_k"]["hmac"]) + 10n).toString(16)
				// },
				s_accent: s_accent.toString(16)
			}),
		}
	).then((resp) => resp.json());
}

const sendTransaction = async (tx: Transaction, r: bigint, s: bigint, v: number) => {
	const prov = new InfuraProvider("goerli")
	console.log("provider:", prov)

	const sig = Signature.from()
	sig.r = r.toString(16)
	sig.s = s.toString(16)
	sig.v = v

	tx.signature = sig

	const wallet = ethers.recoverAddress(tx.unsignedHash, sig)
	console.log("wallet (if everything went right): ", wallet, " === ", tx.from)

	tx.nonce = await prov.getTransactionCount(wallet)
	tx.chainId = (await prov.getNetwork()).chainId

	const result = await prov.broadcastTransaction(tx.serialized)
	console.log("PENDING TX:", result)
}
