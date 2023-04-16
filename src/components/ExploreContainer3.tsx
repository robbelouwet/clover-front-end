import { useEffect, useState } from 'react';

import { exchange_signature } from "../logic/client"
import { Transaction } from "ethers"
import {
  CDBInput,
  CDBCard,
  CDBCardBody,
  CDBContainer,
  CDBBtn
} from 'cdbreact';

const defaultTx = () => {
  const tx = new Transaction()
  tx.chainId = 1
  tx.gasLimit = 0
  tx.maxFeePerGas = 3000000000
  tx.maxPriorityFeePerGas = 2000000000
  tx.nonce = 1
  tx.to = '0xd3CdA913deB6f67967B99D67aCDFa1712C293601'
  tx.type = 2
  tx.value = 12345

  return tx
}

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  const [tx, setTx] = useState(defaultTx().toJSON())

  const updateTx = (key: string, val: number) => {
    let copy = { ...tx }
    copy[key] = val
    setTx(copy)
  }

  useEffect(() => {
    console.log("tx", tx)
    updateTx("chainId", 2)
  }, [])

  const doIt = () => {

    // 0xb4cd6910672fc82f923ca13b8d239f61a221bb86cce99ef6a973988e105c6e8dn
    const strClientKey = localStorage.getItem("client_key")
    if (!strClientKey) {
      alert("Not registered or logged in")
      return
    }

    console.log("localStorage: ", strClientKey)

    const client_sk: bigint = BigInt(strClientKey!);
    exchange_signature(client_sk, toTransaction(tx))
  }

  return (
    <CDBContainer>
      <CDBCard style={{ width: '30rem' }}>
        <CDBCardBody className="mx-4">
          <div className="text-center mt-4 mb-2">
            <p className="h4"> Transaction </p>
          </div>
          <CDBInput material value={tx.chainId} onChange={(e: any) => updateTx('chainId', e.target.value)} placeholder='chain ID' type="number" />
          <CDBInput material value={tx.gasLimit} onChange={(e: any) => updateTx('gasLimit', e.target.value)} placeholder='Gas Limit' type="number" />
          <CDBInput material value={tx.maxFeePerGas} onChange={(e: any) => updateTx('maxFeePerGas', e.target.value)} placeholder='Max fee per gas' type="number" />
          <CDBInput material value={tx.maxPriorityFeePerGas} onChange={(e: any) => updateTx('maxPriorityFeePerGas', e.target.value)} placeholder="Max priority fee per gas" type="number" />
          <CDBInput material value={tx.nonce} onChange={(e: any) => updateTx('nonce', e.target.value)} placeholder="Transaction nonce" type="number" />
          <CDBInput material value={tx.to} onChange={(e: any) => updateTx('to', e.target.value)} placeholder="Destination address" type="text" />
          <CDBInput material value={tx.type} onChange={(e: any) => updateTx('type', e.target.value)} placeholder="Type" type="number" />
          <CDBInput material value={tx.value} onChange={(e: any) => updateTx('value', e.target.value)} placeholder="Value" type="number" />
          <CDBBtn onClick={doIt} color="dark" className="btn-block my-3 mx-0">
            Send Transaction
          </CDBBtn>
        </CDBCardBody>
      </CDBCard>
    </CDBContainer>
  );
};

const toTransaction = (v: any) => {
  {/*
    tx.chainId = 1
    tx.gasLimit = 0
    tx.maxFeePerGas = 3000000000
    tx.maxPriorityFeePerGas = 2000000000
    tx.nonce = 1
    tx.to = '0xd3CdA913deB6f67967B99D67aCDFa1712C293601'
    tx.type = 2
    tx.value = 12345
  */}
  const tx = new Transaction()
  tx.chainId = BigInt(v["chainId"])
  tx.gasLimit = BigInt(v["gasLimit"])
  tx.maxFeePerGas = BigInt(v["maxFeePerGas"])
  tx.maxPriorityFeePerGas = BigInt(v["maxPriorityFeePerGas"])
  tx.nonce = BigInt(v["nonce"])
  tx.to = v["to"]
  tx.type = v["type"]
  tx.value = v["value"]

  return tx

}

export default ExploreContainer;
