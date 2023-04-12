import '../theme/ExploreContainer.css';
import { exchange_signature } from "../logic/elliptic/client"
import { Transaction } from "ethers"

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {

  const doIt = () => {
    const tx = new Transaction()
    tx.chainId = 1
    tx.gasLimit = 0
    tx.maxFeePerGas = 3000000000
    tx.maxPriorityFeePerGas = 2000000000
    tx.nonce = 1
    tx.to = '0xd3CdA913deB6f67967B99D67aCDFa1712C293601'
    tx.type = 2
    tx.value = 12345

    const client_sk = 0xb4cd6910672fc82f923ca13b8d239f61a221bb86cce99ef6a973988e105c6e8dn;
    exchange_signature(client_sk, tx)
  }
  return (
    <div className="container">
      <strong>{name}</strong>
      <p>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
      <a href={`${process.env.REACT_APP_CLOVER_BACKEND}/.auth/login/google?post_login_redirect_uri=${window.location.origin}`}>Google login</a>
      <button onClick={doIt}>Send Transaction</button>
    </div>
  );
};

export default ExploreContainer;
