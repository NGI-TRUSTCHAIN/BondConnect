import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createTransferHistoric, readBonds, readTransferHistory, updateBond } from "../../features/bondSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Bond, TokenState } from "../../Bond";

export interface TransferInfo {
  _id: string | undefined;
  tokenName: string;
  tokenNumber: number | undefined;
  destinationBlockchain: string;
  originBlockchain: string;
}

const BlockchainTransfer = () => {
  const [transferData, setTransferData] = useState<TransferInfo>({
    _id: undefined,
    tokenName: "",
    tokenNumber: undefined,
    destinationBlockchain: "",
    originBlockchain: "",
  });

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for tokenNumber to ensure it's converted to a number
    if (name === 'tokenNumber') {
      setTransferData((prevData) => ({
        ...prevData,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setTransferData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // const [token, setToken] = useState("");
  // const [number, setNumber] = useState(0);
  // const [destination, setDestination] = useState("");
  // const [wallet, setWallet] = useState("");
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [tokensLeft, setTokensLeft] = useState(0);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const registeredBonds = useAppSelector((state) => state.bond.bonds);
  // const transferHistory = useAppSelector((state) => state.bond.transferHistory);
  const error = useAppSelector((state) => state.bond.error);
  const [showPopup, setShowPopup] = useState(false);
  const blockchains = ["ALASTRIA", "AMOY"];
  const userLoged = useAppSelector((state) => state.user.userLoged);
  const userId = userLoged?._id;
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success/error modal
  const [transactionDetails, setTransactionDetails] = useState<any>(null); // State for transaction details
  const [requestResult, setRequestResult] = useState<any>(null); // State for request result

  useEffect(() => {
    document.title = "Blockchain Transfer";
    dispatch(readBonds(userId || ""));
    // dispatch(readTransferHistory());
    console.log("Dispatched fetchBonds");
  }, [dispatch]);

  useEffect(() => {
    if (transferData.tokenName) {
      console.log(`Input value changed: ${transferData.tokenName}`);
      const bond = registeredBonds?.find((bond) => bond._id === transferData.tokenName) || null;
      setSelectedBond(bond);
      console.log('Selected bond:', bond);
      bond?.tokenState.forEach((block) => {
        if (block.blockchain === transferData.originBlockchain) {
          setTokensLeft(block.amount);
          console.log('Tokens left:', block.amount);
        }
      });
    }
  }, [transferData.tokenName, transferData.originBlockchain, registeredBonds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    // console.log(token, number, destination, wallet);
    // navigate("/confirm", { state: { formData } });
  };

  // Handle form data submit or show pop-up
  const handleShowPopup = () => {
    setShowPopup(true);
  };

  // Handle closing of the pop-up
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Handle the actual form submission or any action when "Create bond" is clicked
  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    const bond = JSON.parse(JSON.stringify(selectedBond));

    const transferBlock: TokenState = bond.tokenState.find((block: TokenState) => block.blockchain === transferData.destinationBlockchain);

    if (!transferBlock) {
      bond.tokenState!.push({ blockchain: transferData.destinationBlockchain, amount: transferData.tokenNumber! });
    } else {
      transferBlock.amount += Number(transferData.tokenNumber!);
    }
    console.log(bond);

    try {
      console.log("transferData: ", transferData);
      const result = await dispatch(createTransferHistoric(transferData));
      if (result.meta.requestStatus === 'fulfilled') {
        setRequestResult(result);
        setTransactionDetails(result.payload); // Guardar los detalles de la transacción
        setShowSuccessModal(true); // Mostrar el modal de éxito
        toast.success("Success");
      } else {
        setTransactionDetails(result.payload); // Guardar los detalles del error
        setShowSuccessModal(true); // Mostrar el modal de error
        toast.error(`Failed to transfer tokens. Please try again.\n ${result.payload}`);
      }
    } catch (error) {
      setTransactionDetails(error); // Guardar el error
      setShowSuccessModal(true); // Mostrar el modal de error
      toast.error(`Failed to transfer tokens. Please try again.\n ${error}`);
    } finally {
      setIsLoading(false);
      setShowPopup(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/issuer-dash');
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
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3" style={{ width: "75%" }}>
        <form
          className="container mt-4"
          style={{ textAlign: "left" }}
          onSubmit={handleSubmit} // Attach the submit handler
        >
          <h2 className="text-primary" style={{ textAlign: "center" }}>
            CROSS-CHAIN BRIDGE
          </h2>

          <div className="container-md m-3">
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="originBlockchain" className="form-label">
                  Origin Blockchain:
                </label>
                <select
                  id="originBlockchain"
                  name="originBlockchain"
                  value={transferData.originBlockchain}
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
              <div className="col-sm-6 mb-3">
                <label htmlFor="destinationBlockchain" className="form-label">
                  Destination DLT Blockchain:
                </label>
                <select
                  id="destinationBlockchain"
                  name="destinationBlockchain"
                  value={transferData.destinationBlockchain}
                  className="form-control bg-form"
                  onChange={handleData}>
                  <option value="" disabled>
                    Select destination blockchain{" "}
                  </option>
                  {blockchains.map((blockchain) => (
                    <option key={blockchain} value={blockchain} disabled={blockchain === transferData.originBlockchain}>
                      {blockchain}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="tokenName" className="form-label">
                  Token Selection:
                </label>
                <select
                  id="tokenName"
                  name="tokenName"
                  className="form-control bg-form"
                  value={transferData.tokenName}
                  onChange={handleData}>
                  <option value="" disabled>
                    Select token
                  </option>
                  {/* {!error &&
                    registeredBonds?.map((bond) => (
                      bond.blockchainNetwork === transferData.originBlockchain &&
                      <option key={bond._id} value={bond.bondName}>
                        {bond.bondName} 
                      </option>
                    ))
                  } */}
                  {!error &&
                    registeredBonds?.map((bond) => {
                      // Verificar si algún objeto dentro de tokenState tiene blockchain igual a la blockchain seleccionada
                      const isBlockchainMatch = bond.tokenState.some(
                        (block) => block.blockchain === transferData.originBlockchain
                      );

                      return (
                        isBlockchainMatch && (
                          <option key={bond._id} value={bond._id}>
                            {bond.bondName}
                          </option>
                        )
                      );
                    })}
                </select>
              </div>

              <div className="col-sm-6 mb-3">
                <label htmlFor="tokenNumber" className="form-label">
                  Number of Tokens:
                </label>
                <input
                  type="number"
                  max={tokensLeft}
                  id="tokenNumber"
                  name="tokenNumber"
                  className="form-control bg-form"
                  placeholder={`${tokensLeft} available`}
                  value={transferData.tokenNumber}
                  onChange={handleData}
                />
              </div>
            </div>
          </div>
          <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button
              type="submit"
              className="btn btn-primary col-sm-4"
              style={{ alignItems: "right" }}
              onClick={handleShowPopup}>
              Confirm
            </button>
            <button
              type="button"
              className="btn btn-primary col-sm-2"
              onClick={() => navigate("/issuer-dash")}
              style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
              Cancel
            </button>
          </div>
        </form>
        <ToastContainer />
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2 className="text-primary mb-5" style={{ textAlign: "center" }}>
                INTER-BLOCKCHAIN TRANSFER
              </h2>
              <h3 style={{ textAlign: "left" }}>Origin: {transferData.originBlockchain}</h3>
              <h3 style={{ textAlign: "left" }}>Destination: {transferData.destinationBlockchain}</h3>
              <h3 style={{ textAlign: "left" }}>Token: {transferData?.tokenName}</h3>
              <h3 style={{ textAlign: "left" }}>Number: {transferData.tokenNumber}</h3>

              <div className="popup-actions">
                <button className="btn btn-primary" onClick={handleConfirmSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm transaction'
                  )}
                </button>
                <button className="btn btn-secondary" onClick={handleClosePopup} disabled={isLoading}>
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
                {requestResult?.meta?.requestStatus === 'rejected' ? 'Transfer Error!' : 'Successful Transfer!'}
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
                        <strong>Transaction:</strong>
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          <a href={getPrefixedTrx(transferData.destinationBlockchain, transactionDetails.trx)} target="_blank" rel="noopener noreferrer">{transactionDetails.trx}</a>
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

export default BlockchainTransfer;
