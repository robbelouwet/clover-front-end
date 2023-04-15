import * as arith from 'bigint-mod-arith'

export class Point {
    __curve__: [bigint, bigint];
    __n__: bigint
    __q__: bigint
    __x__: bigint
    __y__: bigint

    constructor(curve: [bigint, bigint], G: [bigint, bigint], q: bigint, n: bigint) {
        this.__curve__ = curve
        this.__n__ = n
        this.__q__ = q
        this.__x__ = G[0]
        this.__y__ = G[1]
    }

    add(other: Point): Point {
        // P (+) Inf
        if (other instanceof Inf) {
            return this
        }

        // P (+) P
        if (other.__x__ === this.__x__ && other.__y__ === this.__y__) {
            return this.add_identity()
        }

        // P (+) -P
        if (other.__x__ === this.__x__ && !(other.__y__ === this.__y__)) {
            return new Inf(this.__curve__, this.__q__, this.__n__)
        }

        else return this.add_diff(other)
    }

    multiply(n: bigint): Point {
        let r = new Inf(this.__curve__, this.__q__, this.__n__)
        let q = new Point(this.__curve__, [this.__x__, this.__y__], this.__q__, this.__n__)

        while (n > 0n) {
            if (n % 2n === 1n) {
                r = r.add(q)
            }
            q = q.add(q)
            n = n / 2n
        }

        return r
    }

    verify() {
        return this.__y__ ** 2n === this.__x__ ** 3n + this.__curve__[0] * this.__x__ + this.__curve__[1]
    }

    add_diff(other: Point) {
        let x2 = other.__x__;
        let y2 = other.__y__;
        //assert(this.__n__ == other.__n__)

        let x1 = this.__x__
        let y1 = this.__y__

        let delta_teller = y2 - y1
        let delta_noemer = x2 - x1

        let delta_noemer_inv = arith.modInv(delta_noemer, this.__q__)

        let delta = arith.modPow(delta_teller * delta_noemer_inv, 1, this.__q__)

        let x3 = arith.modPow((delta ** 2n) - x1 - x2, 1, this.__q__)
        let y3 = arith.modPow(delta * (x1 - x3) - y1, 1, this.__q__)

        return new Point(this.__curve__, [x3, y3], this.__q__, this.__n__)
    }

    add_identity() {
        let x1 = this.__x__
        let x2 = this.__x__
        let y1 = this.__y__

        let delta_teller = 3n * (x1 ** 2n) + this.__curve__[0]
        let delta_noemer = 2n * y1

        let delta_noemer_inv = arith.modInv(delta_noemer, this.__q__)
        let delta = arith.modPow(delta_teller * delta_noemer_inv, 1, this.__q__)

        let x3 = arith.modPow(delta ** 2n - x1 - x2, 1, this.__q__)
        let y3 = arith.modPow(delta * (x1 - x3) - y1, 1, this.__q__)

        return new Point(this.__curve__, [x3, y3], this.__q__, this.__n__)
    }

    toString() {
        return `(0x${this.__x__.toString(16)}, 0x${this.__y__.toString(16)})`
    }

}

export class Inf extends Point {
    constructor(curve: [bigint, bigint], q: bigint, n: bigint) {
        super(curve, [0n, 0n], q, n)
    }

    add(other: Point): Point {
        return other
    }
}

export const generateCompositeKeypair = () => {
    const compositeKey = rnd256();
    const clientKey = rnd256();
    const clientKeyInverse = arith.modPow(clientKey, -1, secp256k1.__q__)
    const serverKey = arith.modPow(compositeKey * clientKeyInverse, 1, secp256k1.__q__)

    return [compositeKey, clientKey, serverKey]
}

export const to_secp256k1_point = (x: bigint, y: bigint): Point => {
    return new Point(
        secp256k1.__curve__,
        [x, y],
        secp256k1.__q__,
        secp256k1.__n__
    )
}



/**
 * Generates a cryptographically secure 256-bit random number (bigint) using the browser's native crypto API
 * 
 * @returns the random number
 */
export const rnd256 = (): bigint => {
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

export const secp256k1 = new Point(
    [0n, 7n],
    [0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n,
        0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n],
    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn,
    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n)