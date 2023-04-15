import { secp256k1, to_secp256k1_point, Point } from "./ecdsa";
import { Transaction } from "ethers";
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

};

const key_exchange = async (client_R: Point, tx: Transaction): Promise<any> => {
	// R2
	const str_x_R2 = "0x" + client_R.__x__.toString(16);
	const str_y_R2 = "0x" + client_R.__y__.toString(16);

	const _body = tx.unsignedSerialized.toString()
	console.log("req body init-kex: ", _body)

	// Key Exchange
	return await fetch(
		`${process.env.REACT_APP_CLOVER_BACKEND}/api/initiate-kex?x=${str_x_R2}&y=${str_y_R2}&code=2C80YgacJFX8pXYxdentxCf6XL_X6ZXk3b_P37Q3o0m2AzFumFDT9A==`,
		{
			method: "PUT",
			credentials: process.env.NODE_ENV === 'production' ? 'include' : 'omit',
			headers: {
				"Content-Type": "application/octet-stream",
			},
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



	// Push the transaction and partial signature, receive the full signature pair (r, s, v)
	return await fetch(
		`${process.env.REACT_APP_CLOVER_BACKEND}/api/push-sig?code=2C80YgacJFX8pXYxdentxCf6XL_X6ZXk3b_P37Q3o0m2AzFumFDT9A==`,
		{
			method: "PUT",
			credentials: process.env.NODE_ENV === 'production' ? 'include' : 'omit',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				tx: tx.unsignedSerialized,
				R_client: {
					x: client_R.__x__.toString(16),
					y: client_R.__y__.toString(16)
				},
				// !!!!!!!!!! TODO: even though it's encrypted, malleability is still possible (?), checksum before encrypting? !!!!!!!!!!!
				paillier_server_k: keys["paillier_server_k"],
				s_accent: s_accent.toString(16)
			}),
		}
	).then((resp) => resp.json());
}
