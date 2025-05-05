import { useEffect, useState } from "react";
import { Bond } from "../../Bond";
import { Investor } from "../Authentication/InvestorRegistration";
import { UserData } from "../UserRegistration";
import { useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../../features/bondSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toast, ToastContainer } from "react-toastify";

const BondDetails = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate()
  const { bond, user }: { bond: Bond; user: Investor } = location.state;

  const error = useAppSelector((state) => state.bond.error);

  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [tokens, setTokens] = useState(0);

  const [userData, setUserData] = useState<UserData>({
    _id: undefined,
    userId: user.email,
    destinationBlockchain: bond.blockchainNetwork,
    investToken: bond.bondName,
    purchasedTokens: tokens,
  });

  useEffect(() => {
    document.title = `${bond.bondName} - Details`;
    console.log("Bond:", bond);
    console.log("User:", user);
  }, [bond, user]);
 
  useEffect(() => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      purchasedTokens: tokens,
    }));
  }, [tokens]);
  

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right", // Posición del toast
        autoClose: 3000, // Se cierra en 3 segundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark", // También puedes usar "light", "colored", etc.
      });
    }
  }, [error]);

  const handleBuy = () => {
    setShowPopup(true);
    console.log(showPopup);
  };

  const handleClosePopup = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el clic es en el overlay (fuera del popup), cierra el popup
    if (e.target === e.currentTarget) {
      setShowPopup(false);
    }
  };

  const handleConfirmBuy = async () => {
    await dispatch(registerUser(userData));
    setShowPopup(false);
    navigate('/investor-dash')
  };

  return (
    <div className="container" style={{ width: "70vh" }}>
      <div className="card mt-3 p-4">
        <h2 className="text-primary mb-4 text-start" style={{ marginLeft: "5rem" }}>
          {bond.bondName}
        </h2>

        <div className="mb-3">
          <h4 className="text-primary text-start" style={{ marginLeft: "5rem" }}>
            Issuer Company Details:
          </h4>
          <ul>
            <li>
              <strong>Company Name:</strong> <em>SME Name</em>
            </li>
            <li>
              <strong>Tax ID Number:</strong> <em>B12345678</em>
            </li>
            <li>
              <strong>Website:</strong> <em>https://companyname.es</em>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-primary text-start" style={{ marginLeft: "5rem" }}>
            Bond Details:
          </h4>
          <ul>
            <li>
              <strong>Bond Name:</strong> <em>{bond.bondName}</em>
            </li>
            <li>
              <strong>Bond Purpose:</strong> <em>{bond.bondPurpose}</em>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-primary text-start" style={{ marginLeft: "5rem" }}>
            Key Dates:
          </h4>
          <ul>
            <li>
              <strong>Start Date:</strong>{" "}
              <em>{bond.bondStartDate ? new Date(bond.bondStartDate).toLocaleDateString() : "N/A"}</em>
            </li>
            <li>
              <strong>Maturity Date:</strong>{" "}
              <em>{bond.bondMaturityDate ? new Date(bond.bondMaturityDate).toLocaleDateString() : "N/A"}</em>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-primary text-start" style={{ marginLeft: "5rem" }}>
            Financial Terms:
          </h4>
          <ul>
            <li>
              <strong>Interest Rate:</strong> <em>{bond.interestRate ? `${bond.interestRate}%` : "N/A"}</em>
            </li>
            <li>
              <strong>Coupon Payment Frequency:</strong> <em>{bond.paymentFreq}</em>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-primary text-start" style={{ marginLeft: "5rem" }}>
            Tokenization Details:
          </h4>
          <ul>
            <li>
              <strong>Number of Tokens:</strong> <em>{bond.numberTokens}</em>
            </li>
            <li>
              <strong>Nominal Value:</strong> <em>100€</em>
            </li>
            <li>
              <strong>DLT of Issuance:</strong> <em>{bond.blockchainNetwork}</em>
            </li>
          </ul>
        </div>

        <button className="btn btn-primary ms-3" onClick={handleBuy}>
          BUY
        </button>
      </div>
      <ToastContainer />
      {showPopup && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup">
            <h2 className="text-primary mb-4" style={{ textAlign: "left" }}>
              BUY TOKEN
            </h2>

            <div className="row d-flex justify-content-center align-items-center">
              <div className="col-sm-6 mb-3">
                <label htmlFor="userId" className="form-label">
                  User ID:
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  className="form-control bg-form"
                  placeholder={`Id`}
                  value={user.email}
                  disabled
                />
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="destinationBlockchain" className="form-label">
                  Destination Blockchain:
                </label>
                <input
                  id="destinationBlockchain"
                  name="destinationBlockchain"
                  value={bond.blockchainNetwork}
                  className="form-control bg-form"
                  disabled
                />
              </div>

              <div className="col-sm-6 mb-3">
                <label htmlFor="investToken" className="form-label">
                  Token Selection:
                </label>
                <input
                  id="investToken"
                  name="investToken"
                  className="form-control bg-form"
                  value={bond.bondName}
                  disabled
                />
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="purchasedTokens" className="form-label">
                  Number of Tokens:
                </label>
                <input
                  type="number"
                  id="purchasedTokens"
                  name="purchasedTokens"
                  className="form-control bg-form"
                  value={tokens}
                  placeholder={`15`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokens(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
              <button className="btn btn-primary" onClick={handleConfirmBuy}>
                CONFIRM
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BondDetails;
