import React, { FormEvent, useEffect, useState } from "react";
import { addRetailMktBond, readUserBonds, getRetailMktBonds } from "../../features/bondSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";

export interface MarketData {
  _id?: string;
  investToken: string;
  numTokensOffered?: number;
  destinationBlockchain: string;
}

const RetailMarket = () => {
  const errorMessage = useAppSelector((state) => state.bond.error);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const blockchains = ["ALASTRIA", "AMOY"];
  const registeredBonds = useAppSelector((state) => state.bond.bonds);
  const retailBonds = useAppSelector((state) => state.bond.retailBonds);
  const userLoged = useAppSelector((state) => state.user.userLoged);
  const userId = userLoged?._id;

  

  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [created, setCreated] = useState(null);
  const [marketData, setMarketData] = useState<MarketData>({
    _id: undefined,
    investToken: "",
    numTokensOffered: undefined,
    destinationBlockchain: "",
  });

  const calculateTotalTokens = (bondId: string, blockchain: string): number => {
    if (!bondId || !blockchain || !registeredBonds) return 0;
    const bond = registeredBonds.find(bond => bond._id === bondId);
    if (!bond) return 0;
    // Find tokens in retail market for this bond and blockchain
    const retailEntry = retailBonds?.find(rb => 
      rb._id === bondId && 
      rb.blockchainNetwork === blockchain.toUpperCase()
    );

    // Calculate available tokens by subtracting retail tokens from total
    const totalTokens = bond.tokenState.find(entry => 
      entry.blockchain === blockchain.toUpperCase()
    )?.amount ?? 0;
    
    return totalTokens - (retailEntry?.numberTokens || 0);
  };

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMarketData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    document.title = "Register User";
    dispatch(readUserBonds({ userId: userId || "", walletAddress: userLoged?.walletAddress || "" }));
    dispatch(getRetailMktBonds());
    if (errorMessage !== null && errorMessage !== undefined) {
      console.log(errorMessage);
    }
  }, [errorMessage, dispatch, userId, userLoged?.walletAddress]);

  useEffect(() => {
    if (created) {
      navigate("/issuer-dash");
    }
  }, [created]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(marketData);
    setShowPopup(true);
  };

  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(marketData);
    const market = await dispatch(addRetailMktBond(marketData)).unwrap();
    setCreated(market);
    console.log(market);
  };
  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3">
        <form className="container row mt-4" style={{ textAlign: "left" }}>
          <h2 className="text-primary mb-4" style={{ textAlign: "center" }}>
            ADD TO RETAIL MARKET
          </h2>

          <div className="col-sm-6 mb-3">
            <label htmlFor="destinationBlockchain" className="form-label">
              Destination DLT Network:
            </label>
            <select
              id="destinationBlockchain"
              name="destinationBlockchain"
              value={marketData.destinationBlockchain}
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
            <label htmlFor="investToken" className="form-label">
              Token Selection:
            </label>
            <select
              id="investToken"
              name="investToken"
              className="form-control bg-form"
              value={marketData.investToken}
              onChange={handleData}>
              <option value="" disabled>
                Select token
              </option>
              {!errorMessage &&
                registeredBonds?.map((bond) => {
                  // Check if bond has tokens in the selected blockchain
                  const hasTokenInBlockchain = bond.blockchainNetwork === marketData.destinationBlockchain.toUpperCase();

                  // Only render option if bond has tokens in selected blockchain
                  return hasTokenInBlockchain && (
                    <option key={bond._id} value={bond._id}>
                      {bond.bondName}
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="row">
            <div className="col-sm-6 mb-3">
              <label htmlFor="numTokensOffered" className="form-label">
                Number of Tokens:
              </label>
              <div className="input-group">
                <input type="number"
                  id="numTokensOffered"
                  name="numTokensOffered"
                  className="form-control bg-form"
                  value={marketData.numTokensOffered}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const maxTokens = calculateTotalTokens(marketData.investToken, marketData.destinationBlockchain);
                    e.target.value = Math.min(value, maxTokens).toString();
                    handleData(e);
                  }}
                  max={calculateTotalTokens(marketData.investToken, marketData.destinationBlockchain)}
                />
                <span className="input-group-text bg-light">
                  / {calculateTotalTokens(marketData.investToken, marketData.destinationBlockchain)}
                </span>
              </div>
            </div>

            {marketData.investToken && (
              <div className="col-sm-6 mb-3 d-flex align-items-end">
                <div className="price-display p-3" style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  width: '100%'
                }}>
                  <span className="h4 mb-0 text-primary">
                    {registeredBonds?.find(bond => bond._id === marketData.investToken)?.price?.toFixed(2)} €
                  </span>
                  <span className="text-muted ms-2">per token</span>
                </div>
              </div>
            )}
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
                ADD TO RETAIL MARKET
              </h2>

              <h5 className="fw-bold fst-italic mt-4">
                <em>Final Summary</em>
              </h5>

              <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                  <strong>Token Sent Name:</strong> <em>{marketData?.investToken}</em>
                </li>
                <li>
                  <strong>Number of Tokens:</strong> <em>{marketData?.numTokensOffered}</em>
                </li>
                <li>
                  <strong>Destination Blockchain Network:</strong> <em>{marketData?.destinationBlockchain}</em>
                </li>
              </ul>

              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-primary" onClick={handleConfirmSubmit}>
                  CONFIRM
                </button>
                <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailMarket;
