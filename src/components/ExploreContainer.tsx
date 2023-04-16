import "../theme/ExploreContainer.css"
import { exchange_signature } from "../logic/client"
import { Transaction } from "ethers"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'


interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {


  return (
    <div className="container">
      <strong>{name}</strong>
      <p>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
      <a href={
        process.env.NODE_ENV === "production"
          ? `${process.env.REACT_APP_CLOVER_BACKEND}/.auth/login/google?post_login_redirect_uri=${window.location.origin}`
          : ""
      }><FontAwesomeIcon icon={faGoogle} size='xl' /></a>
    </div>
  );
};

export default ExploreContainer;
