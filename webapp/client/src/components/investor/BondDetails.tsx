import { useEffect, useState } from "react";
import { Bond, TokenState } from "../../Bond";
import { Investor } from "../Authentication/InvestorRegistration";
import { PurchaseData } from "../issuer/BuyToken";
import { useLocation, useNavigate } from "react-router-dom";
import { registerPurchase } from "../../features/bondSlice";
import { getOneIssuer } from "../../features/userSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toast, ToastContainer } from "react-toastify";
import { Issuer } from "../Authentication/IssuerRegistration";

const BondDetails = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { bond, user }: { bond: Bond; user: Investor } = location.state;

  const [issuer, setIssuer] = useState<Issuer | null>(null);

  const error = useAppSelector((state) => state.bond.error);

  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [tokens, setTokens] = useState<number>(0);

  // Seleccionar blockchain para baber token maximos que puedes comprar
  // const [selectedBlockchain, setSelectedBlockchain] = useState<string>(bond.tokenState[0].blockchain || "");
  // const selectedEntry = bond.tokenState.find(
  //   (entry: TokenState) => entry.blockchain === selectedBlockchain
  // );
  useEffect(() => {
    setPurchaseData((prev) => ({
      ...prev,
      destinationBlockchain: bond.blockchainNetwork,
      purchasedTokens: tokens,
    }));
  }, [bond.blockchainNetwork, tokens]);

  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    _id: undefined,
    userId: user._id || '', // Provide empty string as fallback
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
    const getIssuerData = async () => {
      const issuer = await dispatch(getOneIssuer(bond.creatorCompany || '')).unwrap();
      console.log("Issuer:", issuer);
      if (issuer) {
        setIssuer(issuer);
      }
    };
    getIssuerData();
  }, [bond]);

  // useEffect(() => {
  //   setUserData((prevUserData) => ({
  //     ...prevUserData,
  //     purchasedTokens: tokens,
  //   }));
  // }, [tokens]);

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
    setIsLoading(true);
    try {
      const result = await dispatch(registerPurchase(purchaseData));
      console.log('Resultado de result', result);
      setRequestResult(result);
      if (result.meta.requestStatus === 'rejected') {
        setShowPopup(false);
        setShowSuccessModal(true);
        setTransactionDetails(result.payload);
      } else if (result.payload) {
        console.log('Resultado de registerPurchase:', result.payload);
        setPurchaseDetails(result.payload.purchase);
        setTransactionDetails(result.payload.transactions);
        setShowPopup(false);
        setShowSuccessModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/investor-dash");
  };

  const getPrefixedTrx = (network: string, trx: string) => {
    console.log("network: ", network);
    console.log("trx: ", trx);
    switch (network) {
      case 'ALASTRIA':
        return `https://b-network.alastria.izer.tech/tx/${trx}`;
      case 'AMOY':
        return `https://amoy.polygonscan.com/tx/${trx}`;
      default:
        return trx; // Sin prefijo si no coincide
    }
  };

  return (
    <div className="container d-flex justify-content-center" style={{ width: "140vh" }}>
      <style>
        {`
          .spinner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            border-radius: 8px;
          }
          .popup {
            position: relative;
          }
        `}
      </style>
      <div className="card mt-3 p-4">
        <h2 className="text-primary mb-4 text-start" >
          {bond.bondName}
        </h2>

        <div className="mb-3">
          <h4 className="text-primary text-start" style={{ marginLeft: "5rem" }}>
            Issuer Company Details:
          </h4>
          <ul>
            <li>
              <strong>Company Name:</strong> <em>{issuer?.entityLegalName}</em>
            </li>
            <li>
              <strong>Tax ID Number:</strong> <em>{issuer?.taxIdNumber}</em>
            </li>
            <li>
              <strong>Website:</strong> <em>{issuer?.website}</em>
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
              <strong>DLT of Issuance:</strong> <em>{bond.blockchainNetwork}</em>
            </li>
            <div className="price-display p-3 my-3" style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'inline-block',
              marginLeft: '20px' }}>
              <span className="h4 mb-0 text-primary">{bond.price?.toFixed(2)} €</span>
              <span className="text-muted ms-2">per token</span>
            </div>
          </ul>
        </div>

        <div className="d-flex justify-content-between align-items-center w-100">
          <div style={{ width: "33%" }}></div>
          <div style={{ width: "33%", textAlign: "center" }}>
            <button className="btn btn-primary" onClick={handleBuy}>
              BUY
            </button>
          </div>
          <div style={{ width: "33%", textAlign: "right" }}>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              BACK
            </button>
          </div>
        </div>
        <ToastContainer />
        {showPopup && (
          <div className="popup-overlay" onClick={handleClosePopup}>
            <div className="popup">
              {isLoading && (
                <div className="spinner-overlay">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
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

                {/* <div className="col-sm-6 mb-3">
                  <label htmlFor="destinationBlockchain" className="form-label">
                    Destination Blockchain:
                  </label>
                  <select
                    id="destinationBlockchain"
                    name="destinationBlockchain"
                    className="form-control bg-form"
                    value={selectedBlockchain}
                    onChange={(e) => {
                      setSelectedBlockchain(e.target.value);
                      setTokens(0); // Reiniciar tokens al cambiar de blockchain
                    }}>
                    {bond.tokenState.map((entry: TokenState) => (
                      <option key={entry.blockchain} value={entry.blockchain}>
                        {entry.blockchain}
                      </option>
                    ))}
                  </select>
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
                    min={0}
                    max={selectedEntry?.amount ?? 0}
                    placeholder={`${selectedEntry?.amount ?? 0}`}
                    disabled={!selectedEntry}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = Number(e.target.value); // Valor ingresado por el usuario
                      const max = selectedEntry?.amount ?? 0; // Cantidad maxima de tokens que se puede comprar
                      setTokens(Math.min(value, max)); // Seleccionar el minimo entre el valor ingresado y la cantidad maxima
                    }}
                  />
                </div> */}
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
                  <label htmlFor="purchasedTokens" className="form-label">
                    Number of Tokens:
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      id="purchasedTokens"
                      name="purchasedTokens"
                      className="form-control bg-form"
                      value={tokens}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = Number(e.target.value);
                        const maxTokens = bond.numberTokens || 0;
                        setTokens(Math.min(value, maxTokens));
                      }}
                      max={bond.numberTokens || 0}
                    />
                    <span className="input-group-text bg-light">
                      / {bond.numberTokens || 0}
                    </span>
                  </div>
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
        {showSuccessModal && (
          <div className="popup-overlay">
            <div className="popup" style={{ width: '600px' }}>
              <h2 className="text-success mb-4" style={{ textAlign: "center" }}>
                {requestResult?.meta?.requestStatus === 'rejected' ? 'Purchase Error!' : 'Successful Purchase!'}
              </h2>
              <div className="purchase-details mb-4">
                {requestResult?.meta?.requestStatus === 'rejected' ? (
                  <div className="alert alert-danger" role="alert">
                    {JSON.stringify(transactionDetails, null, 2)}
                  </div>
                ) : (
                  <>
                    <h4 className="text-primary mb-3">Transaction Details:</h4>
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong>Stable:</strong> 
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          <a href={getPrefixedTrx(purchaseDetails.destinationBlockchain, transactionDetails.stable)} target="_blank" rel="noopener noreferrer">{transactionDetails.stable}</a>
                        </div>
                      </li>
                      <li className="mb-3">
                        <strong>Transfer:</strong>
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          <a href={getPrefixedTrx(purchaseDetails.destinationBlockchain, transactionDetails.transfer)} target="_blank" rel="noopener noreferrer">{transactionDetails.transfer}</a>
                        </div>
                      </li>
                    </ul>
                  </>
                )}
              </div>
              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-success" onClick={handleCloseSuccessModal}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BondDetails;
