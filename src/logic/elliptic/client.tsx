import { secp256k1, to_secp256k1_point } from "./Point";
import { Transaction } from "ethers";
import * as arith from "bigint-mod-arith";
import * as paillierBigint from "paillier-bigint";

/*
API transaction hash serialization: 

ethers.js, Transaction::unsignedHash :
Hashes this DynamicFeeTransaction to prepare it for signing.
As per the EIP-1559 specifications, the signature is a secp256k1 signature over
keccak256(0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to,
value, data, accessList])). Here, we compute the keccak256(...) hash.
*/

// The client's multiplicative share of the secret private key of the wallet
const x2_client =
	0xb4cd6910672fc82f923ca13b8d239f61a221bb86cce99ef6a973988e105c6e8dn;
const app_key = `code=${process.env.REACT_APP_FUNCTIONS_APP_KEY}`

export const exchange_signature = async (tx: Transaction) => {

	// ----- PART 1: Key Exchange -----
	const client_k2 = rnd256()
	const keys = await key_exchange(client_k2, tx)

	// ----- PART 2: PARTIAL SIG -----
	const { r, s, v } = await push_partial_signature(keys, client_k2, tx)

	console.log("r: ", r)
	console.log("r: ", s)
	console.log("r: ", v)

	// ----- PART 3: Send transaction -----

};

const key_exchange = async (client_k2: bigint, tx: Transaction): Promise<any> => {
	// R2
	const client_R2 = secp256k1.multiply(client_k2);
	const str_x_R2 = "0x" + client_R2.__x__.toString(16);
	const str_y_R2 = "0x" + client_R2.__y__.toString(16);

	const _body = tx.unsignedSerialized.toString()
	console.log("req body init-kex: ", _body)

	// Key Exchange
	return await fetch(
		`${process.env.REACT_APP_CLOVER_BACKEND}/api/initiate-kex?x=${str_x_R2}&y=${str_y_R2}&${process.env.NODE_ENV === "production" ? app_key : ""}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			body: _body,
		}
	).then((resp) => resp.json())
}

const push_partial_signature = async (keys: any, client_k2: bigint, tx: Transaction): Promise<any> => {

	// client_k2 inverse
	const client_k2_inv = arith.modInv(client_k2, secp256k1.__n__);

	// R
	const R = to_secp256k1_point(
		BigInt(keys["R"]["x"]),
		BigInt(keys["R"]["y"])
	);

	// Paillier public key
	const rho = rnd256()
	const paillier_pk = new paillierBigint.PublicKey(
		BigInt(keys["paillier_pk"]["n"]),
		BigInt(keys["paillier_pk"]["g"])
	);

	// Partial signature s'
	const s_accent = paillier_pk.addition(
		paillier_pk.multiply(
			BigInt(keys["paillier_server_x"]),
			arith.modPow(client_k2_inv * R.__x__ * x2_client, 1, secp256k1.__n__)
		), paillier_pk.encrypt(arith.modPow(client_k2_inv * BigInt(tx.unsignedHash), 1, secp256k1.__n__)
		), paillier_pk.encrypt(secp256k1.__n__ * rho))

	console.log("SERVER KEYS RESPONSE:", keys)



	// Push the transaction and partial signature, receive the full signature pair (r, s, v)
	return await fetch(
		`${process.env.REACT_APP_CLOVER_BACKEND}/api/push-sig?${process.env.NODE_ENV === "production" ? app_key : ""}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				tx: tx.unsignedSerialized,
				paillier_server_k: keys["paillier_server_k"],
				s_accent: s_accent.toString(16)
			}),
		}
	).then((resp) => resp.json());
}

/**
 * Generates a cryptographically secure 256-bit random number (bigint) using the browser's native crypto API
 * 
 * @returns the random number
 */
function rnd256(): bigint {
	const bytes = new Uint8Array(32);

	// load cryptographically random bytes into array
	window.crypto.getRandomValues(bytes);

	// convert byte array to hexademical representation
	const bytesHex = bytes.reduce(
		(o, v) => o + ("00" + v.toString(16)).slice(-2),
		""
	);

	// convert hexademical value to a decimal string
	return BigInt("0x" + bytesHex);
}
