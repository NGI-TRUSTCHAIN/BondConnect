import React, { FormEvent, useEffect, useState } from "react";
import { addRetailMktBond, readBonds } from "../../features/bondSlice";
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
  const blockchains = ["Ethereum", "Alastria", "Binance Smart Chain", "Polygon"];
  const registeredBonds = useAppSelector((state) => state.bond.bonds);

  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [marketData, setMarketData] = useState<MarketData>({
    _id: undefined,
    investToken: "",
    numTokensOffered: undefined,
    destinationBlockchain: "",
  });

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMarketData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    document.title = "Register User";
    dispatch(readBonds());
    if (errorMessage !== null && errorMessage !== undefined) {
      console.log(errorMessage);
    } else {
      // navigate("/dashboard", {state:{email}})
    }
  }, [errorMessage, dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(marketData);
    setShowPopup(true);
  };
  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(marketData);
    await addRetailMktBond(marketData)
    navigate('/issuer-dash')
  };
  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3">
        <form className="container row mt-4" style={{ textAlign: "left" }}>
          <h2 className="text-primary mb-4" style={{ textAlign: "center" }}>
            ADD TO RETAIL MARKET
          </h2>

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
                registeredBonds?.map((bond) => (
                  <option key={bond._id} value={bond._id}>
                    {bond.bondName}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-sm-6 mb-3">
            <label htmlFor="numTokensOffered" className="form-label">
              Number of Tokens:
            </label>
            <input
              type="number"
              id="numTokensOffered"
              name="numTokensOffered"
              className="form-control bg-form"
              placeholder={`15`}
              onChange={handleData}
            />
          </div>
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
