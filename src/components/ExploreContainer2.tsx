import "../theme/ExploreContainer.css"
import { useState, useEffect } from 'react';
import { CDBInput, CDBCard, CDBCardBody, CDBIcon, CDBBtn, CDBLink, CDBContainer } from 'cdbreact';
import { generateCompositeKeypair } from '../logic/ecdsa';
import { Row, Col } from "react-bootstrap"
import { Wallet } from 'ethers';

/*
TODO: als ge zelf wallet en server key specifiet, verifieer dan achteraf correct keypair met dummy sig en ecrecover
*/
const ExploreContainer: React.FC<{}> = () => {
	const [wallet, setWallet] = useState("")
	const [serverKey, setServerKey] = useState("")
	const [generateWallet, setGenerateWallet] = useState(false)
	const [clientKey, setClientKey] = useState("")
	const [compositeKey, setCompositeKey] = useState("")

	const generateNewWallet = () => {
		const [privateKey, _clientKey, _serverKey] = generateCompositeKeypair()
		setClientKey("0x" + _clientKey.toString(16))
		setCompositeKey("0x" + privateKey.toString(16))

		const _wallet = new Wallet(privateKey.toString(16)).address
		setWallet(_wallet)

		console.log("server key: ", _serverKey)

		return [_serverKey, _clientKey, _wallet]
	}

<<<<<<< HEAD
	//TODO: disable 'wallet' input als 'generateWallet' aan is, 'generateWallet' moet ook wallet mee geven
	//      maak ook input field voor identifier, integreer de google login?
=======
  useEffect(() => { console.log("render bc of wallet!: ", wallet) }, [wallet])

  //TODO: disable 'wallet' input als 'generateWallet' aan is, 'generateWallet' moet ook wallet mee geven
  //      maak ook input field voor identifier, integreer de google login?
>>>>>>> 33e0da48d0dc84282839c095f959c2e7ef112b1f

	const submit = () => {
		let realServerKey = ""
		let realClientKey = ""
		let realWallet = ""

		if (generateWallet) {
			const [first, second, third] = generateNewWallet()
			realServerKey = "0x" + first.toString(16)
			realClientKey = "0x" + second.toString(16)
			realWallet = third.toString(16)
		}
		else {
			realServerKey = serverKey
			realClientKey = clientKey
			realWallet = wallet
		}

		const _headers: any = {
			"Content-Type": "application/json",
		}

		if (process.env.NODE_ENV !== "production") {
			_headers["x-ms-client-principal"] = "eyJhdXRoX3R5cCI6Imdvb2dsZSIsImNsYWltcyI6W3sidHlwIjoiaXNzIiwidmFsIjoiaHR0cHM6XC9cL2FjY291bnRzLmdvb2dsZS5jb20ifSx7InR5cCI6ImF6cCIsInZhbCI6Ijg0NDIwNTI3ODMzMy1qdTg5N3JzcGx1bzNvanA4YmRmb2NzdHFlYWNvcjU3NC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSJ9LHsidHlwIjoiYXVkIiwidmFsIjoiODQ0MjA1Mjc4MzMzLWp1ODk3cnNwbHVvM29qcDhiZGZvY3N0cWVhY29yNTc0LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL25hbWVpZGVudGlmaWVyIiwidmFsIjoiMTE3MzM5NzY3OTcxNTk0MDcxMDQyIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2VtYWlsYWRkcmVzcyIsInZhbCI6InJvYmJlbG91d2V0QGdtYWlsLmNvbSJ9LHsidHlwIjoiZW1haWxfdmVyaWZpZWQiLCJ2YWwiOiJ0cnVlIn0seyJ0eXAiOiJhdF9oYXNoIiwidmFsIjoia2xxSzZ4NGNteFVJSmdlTUYtLS1mdyJ9LHsidHlwIjoibmFtZSIsInZhbCI6IlJvYmJlIExvdXdldCJ9LHsidHlwIjoicGljdHVyZSIsInZhbCI6Imh0dHBzOlwvXC9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXC9hXC9BR05teXhZbWh6U2xhUktqWlJfQnpKUHY2SnNkVUVneTFtVkxTTGlyX2ViSXp3PXM5Ni1jIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL2dpdmVubmFtZSIsInZhbCI6IlJvYmJlIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL3N1cm5hbWUiLCJ2YWwiOiJMb3V3ZXQifSx7InR5cCI6ImxvY2FsZSIsInZhbCI6Im5sIn0seyJ0eXAiOiJpYXQiLCJ2YWwiOiIxNjgxNDU0MzI5In0seyJ0eXAiOiJleHAiLCJ2YWwiOiIxNjgxNDU3OTI5In1dLCJuYW1lX3R5cCI6Imh0dHA6XC9cL3NjaGVtYXMueG1sc29hcC5vcmdcL3dzXC8yMDA1XC8wNVwvaWRlbnRpdHlcL2NsYWltc1wvZW1haWxhZGRyZXNzIiwicm9sZV90eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL3dzXC8yMDA4XC8wNlwvaWRlbnRpdHlcL2NsYWltc1wvcm9sZSJ9"
		}

		localStorage.setItem("client_key", realClientKey)
		console.log("set ", localStorage.getItem("client_key"), " to localStorage")

		fetch(
			`${process.env.REACT_APP_CLOVER_BACKEND}/api/sign-up?code=2C80YgacJFX8pXYxdentxCf6XL_X6ZXk3b_P37Q3o0m2AzFumFDT9A==`,
			{
				method: "PUT",
				credentials: process.env.NODE_ENV === 'production' ? 'include' : 'omit',
				headers: _headers,
				body: JSON.stringify({
					"wallet": realWallet,
					"server_x": realServerKey
				}),
			}
		)
	}

	return (
		<div className="container">
			<Row>
				<Col>
					<div className="text-center mt-4 mb-2">
						<p className="h4"> Register </p>
					</div>
					<CDBInput
						onChange={(e: any) => setWallet(e.target.value)}
						disabled={generateWallet}
						value={wallet}
						material
						label="Wallet" />
					<CDBInput
						onChange={(e: any) => setServerKey(e.target.value)}
						value={serverKey}
						disabled={generateWallet}
						material
						label="Server Key" />
					<CDBInput type="Checkbox" checked={generateWallet} onChange={(e: any) => setGenerateWallet(e.target.checked)} />
					<p className="m-0">Generate Wallet</p>
					<CDBBtn onClick={submit} color="dark" className="btn-block my-3 mx-0">
						Register
					</CDBBtn>
				</Col>
				<Col>
					<p>Wallet: <div>{wallet}</div></p>
					<br />
					<p>Your cold private key: <div>{compositeKey}</div></p>
					<br />
					<p>Your clover key: <div>{clientKey}</div></p>
				</Col>
			</Row>
		</div>
	);
};

export default ExploreContainer;
