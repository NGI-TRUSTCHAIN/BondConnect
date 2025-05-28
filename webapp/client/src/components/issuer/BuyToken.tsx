import React, { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getRetailMktBonds, readUserBonds, registerPurchase } from "../../features/bondSlice";
import { useNavigate } from "react-router-dom";
import { readInvestors } from "../../features/userSlice";
import InvestorRegistration from "../Authentication/InvestorRegistration";

export interface PurchaseData {
  _id: string | undefined;
  userId: string;
  destinationBlockchain: string;
  investToken: string;
  purchasedTokens: number | undefined;
}

const BuyToken = () => {
  const errorMessage = useAppSelector((state) => state.bond.error);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const blockchains = ["ALASTRIA", "AMOY"];
  const registeredBonds = useAppSelector((state) => state.bond.bonds);
  const retailMktBonds = useAppSelector((state) => state.bond.retailBonds);
  const investors = useAppSelector((state) => state.user.investors);
  const userLogged = useAppSelector((state) => state.user.userLoged);

  const [showPopupUser, setShowPopupUser] = useState(false); // State to toggle popup visibility
  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [errorData, setErrorData] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    _id: undefined,
    userId: "",
    destinationBlockchain: "",
    investToken: "",
    purchasedTokens: undefined,
  });
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success/error modal
  const [transactionDetails, setTransactionDetails] = useState<any>(null); // State for transaction details
  const [requestResult, setRequestResult] = useState<any>(null); // State for request result

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPurchaseData((prevData) => ({
      ...prevData,
      [name]: name === "userId" ? investors.find(investor => investor.walletAddress === value)?._id : value,
      // Reset investToken when blockchain changes
      ...(name === "destinationBlockchain" ? { investToken: "" } : {})
    }));
  };

  useEffect(() => {
    document.title = "Register User";
    dispatch(readUserBonds({userId: userLogged?._id!, walletAddress: userLogged?.walletAddress!}));
    dispatch(getRetailMktBonds());
    dispatch(readInvestors());
  }, [dispatch]);

  useEffect(() => {
    console.log(registeredBonds);
  }, [registeredBonds]);

  const handleUser = () => {
    for (const user of investors) {
      console.log('user._id', user._id);
      console.log('purchaseData.userId', purchaseData.userId);
      if (user._id!== purchaseData.userId) {
        setErrorData(true);
        console.log(errorData);
      } else {
        setErrorData(false);
      }
    }
  };

  const handleCloseUserPopup = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el clic es en el overlay (fuera del popup), cierra el popup
    if (e.target === e.currentTarget) {
      setShowPopupUser(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorData(false);
    setShowPopup(true);
    console.log(purchaseData);
  };
  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Activar el loader
    try {
      const result = await dispatch(registerPurchase(purchaseData));
      if (result.meta.requestStatus === 'fulfilled') {
        setRequestResult(result);
        setTransactionDetails(result.payload.transactions); // Guardar los detalles de la transacción
        setShowSuccessModal(true); // Mostrar el modal de éxito
      } else {
        setTransactionDetails(result.payload); // Guardar los detalles del error
        setShowSuccessModal(true); // Mostrar el modal de error
      }
    } catch (error) {
      setTransactionDetails(error); // Guardar el error
      setShowSuccessModal(true); // Mostrar el modal de error
    } finally {
      setIsLoading(false); // Desactivar el loader
      setShowPopup(false); // Cerrar el popup de confirmación
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/issuer-dash");
  };

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3">
        <form className="container row mt-4" style={{ textAlign: "left" }}>
          <h2 className="text-primary mb-4" style={{ textAlign: "center" }}>
            ADD INVESTOR
          </h2>

          <div className="col-sm-6 mb-3">
            <label htmlFor="userId" className="form-label">
              User ID:
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              className="form-control bg-form"
              placeholder={`Username`}
              onChange={handleData}
              onBlur={handleUser}
            />
          </div>
          <div className="col-sm-6 mb-3"> 
            <label htmlFor="destinationBlockchain" className="form-label">
              Destination Blockchain:
            </label>
            <select
              id="destinationBlockchain"
              name="destinationBlockchain"
              value={purchaseData.destinationBlockchain}
              className="form-control bg-form"
              onChange={handleData}>
              <option value="" disabled>
                Select origin blockchain
              </option>
              {blockchains.map((blockchain) => (
                <option key={blockchain} value={blockchain}>
                  {blockchain}
                </option>
              ))}
            </select>
          </div>
          {errorData && (
            <p className="text-danger" style={{ fontSize: "13px", marginLeft: "10px" }}>
              User doesn't exists.
              <button type="button" className="btn btn-link" onClick={() => setShowPopupUser(true)}>Crear</button>
            </p>
          )}
          <div className="col-sm-6 mb-3">
            <label htmlFor="investToken" className="form-label">
              Token Selection:
            </label>
            <select
              id="investToken"
              name="investToken"
              className="form-control bg-form"
              value={purchaseData.investToken}
              onChange={handleData}>
              <option value="" disabled>
                Select token
              </option>
              {!errorMessage &&
                retailMktBonds?.map((bond) => {
                  // Verificar si algún objeto dentro de tokenState tiene blockchain igual a la blockchain seleccionada
                  const isBlockchainMatch = bond.blockchainNetwork === purchaseData.destinationBlockchain && bond.creatorCompany === userLogged?._id
                  
                  return (
                    isBlockchainMatch && (
                      <option key={bond._id} value={bond.bondName}>
                        {bond.bondName}
                      </option>
                    )
                  );
                })}
            </select>
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
                onChange={handleData}
                max={retailMktBonds?.find(bond => 
                  bond.bondName === purchaseData.investToken && 
                  bond.blockchainNetwork === purchaseData.destinationBlockchain
                )?.numberTokens}
              />
              <span className="input-group-text bg-light">
                / {retailMktBonds?.find(bond => 
                    bond.bondName === purchaseData.investToken &&
                    bond.blockchainNetwork === purchaseData.destinationBlockchain
                  )?.numberTokens}
              </span>
            </div>
          </div>
          <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button
              type="submit"
              className="btn btn-primary col-sm-4"
              style={{ alignItems: "right" }}
              onClick={handleSubmit}>
              Confirm
            </button>
            <button
              type="button"
              className="btn btn-primary col-sm-2"
              onClick={() => navigate("/manage-bonds")}
              style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
              Cancel
            </button>
          </div>
        </form>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2 className="text-primary mb-4" style={{ textAlign: "left" }}>
                ADD INVESTOR
              </h2>

              <h5 className="fw-bold fst-italic mt-4">
                <em>Final Summary</em>
              </h5>

              <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                  <strong>User:</strong> <em>{purchaseData?.userId}</em>
                </li>
                <li>
                  <strong>Token Sent Name:</strong> <em>{purchaseData?.investToken}</em>
                </li>
                <li>
                  <strong>Number of Tokens:</strong> <em>{purchaseData?.purchasedTokens}</em>
                </li>
                <li>
                  <strong>Destination Blockchain Network:</strong> <em>{purchaseData?.destinationBlockchain}</em>
                </li>
              </ul>

              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-primary" onClick={handleConfirmSubmit} disabled={isLoading}>
                  {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'CONFIRM'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>
                  Edit
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
                          {transactionDetails?.stable}
                        </div>
                      </li>
                      <li className="mb-3">
                        <strong>Transfer:</strong>
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          {transactionDetails?.transfer}
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
        {showPopupUser && (
          <div className="popup-overlay" onClick={handleCloseUserPopup}>
            <div className="popup">
              <InvestorRegistration/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyToken;
