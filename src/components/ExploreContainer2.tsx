import '../theme/ExploreContainer.css';
import { useState } from 'react';
import { CDBInput, CDBCard, CDBCardBody, CDBIcon, CDBBtn, CDBLink, CDBContainer } from 'cdbreact';
import { generateCompositeKeypair } from '../logic/ecdsa';
import { Row, Col } from "react-bootstrap"


const ExploreContainer: React.FC<{}> = () => {
  const [wallet, setWallet] = useState("")
  const [serverKey, setServerKey] = useState("")
  const [generateWallet, setGenerateWallet] = useState(false)
  const [clientKey, setClientKey] = useState("")
  const [compositeKey, setCompositeKey] = useState("")

  const generateNewWallet = () => {
    const [privateKey, partialKey1, partialKey2] = generateCompositeKeypair()
    setClientKey("0x" + partialKey1.toString(16))
    setCompositeKey("0x" + privateKey.toString(16))

    return partialKey2
  }

  //TODO: verwijder 'wallet' input als 'generateWallet' aan is, 'generateWallet' moet ook wallet mee geven
  //      maak ook input field voor identifier, integreer de google login?

  const submit = () => {
    let realServerKey = ""

    if (generateWallet) realServerKey = "0x" + generateNewWallet().toString(16)
    else realServerKey = wallet

    const _body = JSON.stringify({
      "wallet": wallet,
      "server_x": realServerKey
    })
    console.log("body: ", _body)

    fetch(
      `${process.env.REACT_APP_CLOVER_BACKEND}/api/sign-up?code=2C80YgacJFX8pXYxdentxCf6XL_X6ZXk3b_P37Q3o0m2AzFumFDT9A==`,
      {
        method: "POST",
        credentials: process.env.NODE_ENV === 'production' ? 'include' : 'omit',
        headers: {
          "Content-Type": "application/json",
          "x-ms-client-principal": "eyJhdXRoX3R5cCI6Imdvb2dsZSIsImNsYWltcyI6W3sidHlwIjoiaXNzIiwidmFsIjoiaHR0cHM6XC9cL2FjY291bnRzLmdvb2dsZS5jb20ifSx7InR5cCI6ImF6cCIsInZhbCI6Ijg0NDIwNTI3ODMzMy1qdTg5N3JzcGx1bzNvanA4YmRmb2NzdHFlYWNvcjU3NC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSJ9LHsidHlwIjoiYXVkIiwidmFsIjoiODQ0MjA1Mjc4MzMzLWp1ODk3cnNwbHVvM29qcDhiZGZvY3N0cWVhY29yNTc0LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL25hbWVpZGVudGlmaWVyIiwidmFsIjoiMTE3MzM5NzY3OTcxNTk0MDcxMDQyIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2VtYWlsYWRkcmVzcyIsInZhbCI6InJvYmJlbG91d2V0QGdtYWlsLmNvbSJ9LHsidHlwIjoiZW1haWxfdmVyaWZpZWQiLCJ2YWwiOiJ0cnVlIn0seyJ0eXAiOiJhdF9oYXNoIiwidmFsIjoia2xxSzZ4NGNteFVJSmdlTUYtLS1mdyJ9LHsidHlwIjoibmFtZSIsInZhbCI6IlJvYmJlIExvdXdldCJ9LHsidHlwIjoicGljdHVyZSIsInZhbCI6Imh0dHBzOlwvXC9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXC9hXC9BR05teXhZbWh6U2xhUktqWlJfQnpKUHY2SnNkVUVneTFtVkxTTGlyX2ViSXp3PXM5Ni1jIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2dpdmVubmFtZSIsInZhbCI6IlJvYmJlIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL3N1cm5hbWUiLCJ2YWwiOiJMb3V3ZXQifSx7InR5cCI6ImxvY2FsZSIsInZhbCI6Im5sIn0seyJ0eXAiOiJpYXQiLCJ2YWwiOiIxNjgxNDU0MzI5In0seyJ0eXAiOiJleHAiLCJ2YWwiOiIxNjgxNDU3OTI5In1dLCJuYW1lX3R5cCI6Imh0dHA6XC9cL3NjaGVtYXMueG1sc29hcC5vcmdcL3dzXC8yMDA1XC8wNVwvaWRlbnRpdHlcL2NsYWltc1wvZW1haWxhZGRyZXNzIiwicm9sZV90eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL3dzXC8yMDA4XC8wNlwvaWRlbnRpdHlcL2NsYWltc1wvcm9sZSJ9"
        },
        body: _body,
      }
    ).then((resp) => resp.json())
  }

  return (
    <div className="container">
      <Row>
        <Col>
          <CDBContainer>
            <CDBCard style={{ width: '30rem' }}>
              <CDBCardBody className="mx-4">
                <div className="text-center mt-4 mb-2">
                  <p className="h4"> Register </p>
                </div>
                <CDBInput
                  onChange={(e: any) => setWallet(e.target.value)}
                  value={wallet}
                  material
                  label="Wallet" />
                <CDBInput
                  onChange={(e: any) => setServerKey(e.target.value)}
                  value={serverKey} disabled={generateWallet}
                  material
                  label="Server Key" />
                <CDBInput type="Checkbox" checked={generateWallet} onChange={(e: any) => setGenerateWallet(e.target.checked)} />
                <p className="m-0">Generate Wallet</p>
                <CDBBtn onClick={submit} color="dark" className="btn-block my-3 mx-0">
                  Register
                </CDBBtn>
              </CDBCardBody>
            </CDBCard>
          </CDBContainer>
        </Col>
        <Col>
          <h4>{compositeKey !== "" ? `Your cold private key: ${compositeKey}` : ""}</h4>
          <h4>{clientKey !== "" ? `Your clover key ${clientKey}` : ""}</h4>
        </Col>
      </Row>
    </div>
  );
};

export default ExploreContainer;
