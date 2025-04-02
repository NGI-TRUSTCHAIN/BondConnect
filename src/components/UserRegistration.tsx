import React, { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { readBonds, registerUser } from "../features/bondSlice";
import { useNavigate } from "react-router-dom";
import { readInvestors, readIssuers } from "../features/userSlice";
import InvestorRegistration from "./Authentication/InvestorRegistration";

export interface UserData {
  _id: string | undefined;
  userId: string;
  destinationBlockchain: string;
  investToken: string;
  purchasedTokens: number | undefined;
}

const UserRegistration = () => {
  const errorMessage = useAppSelector((state) => state.bond.error);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const blockchains = ["Ethereum", "Alastria", "Binance Smart Chain", "Polygon"];
  const registeredBonds = useAppSelector((state) => state.bond.bonds);
  const investors = useAppSelector((state) => state.user.investors);

  const [showPopupUser, setShowPopupUser] = useState(false); // State to toggle popup visibility
  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [errorData, setErrorData] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    _id: undefined,
    userId: "",
    destinationBlockchain: "",
    investToken: "",
    purchasedTokens: undefined,
  });

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    document.title = "Register User";

    dispatch(readBonds());
    dispatch(readInvestors());
    dispatch(readIssuers());
  }, [dispatch]);

  const handleUser = () => {

    for (const user of investors) {
      if (user.name !== userData.userId) {
        setErrorData(true);
        console.log(errorData);
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
    console.log(userData);
  };
  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await dispatch(registerUser(userData));
    setShowPopup(false);
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
              value={userData.destinationBlockchain}
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
              value={userData.investToken}
              onChange={handleData}>
              <option value="" disabled>
                Select token
              </option>
              {!errorMessage &&
                registeredBonds?.map((bond) => {
                  // Verificar si algún objeto dentro de tokenState tiene blockchain igual a la blockchain seleccionada
                  const isBlockchainMatch = bond.tokenState.some(
                    (block) => block.blockchain === userData.destinationBlockchain
                  );

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
            <input
              type="number"
              id="purchasedTokens"
              name="purchasedTokens"
              className="form-control bg-form"
              placeholder={`15`}
              onChange={handleData}
            />
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
                  <strong>User:</strong> <em>{userData?.userId}</em>
                </li>
                <li>
                  <strong>Token Sent Name:</strong> <em>{userData?.investToken}</em>
                </li>
                <li>
                  <strong>Number of Tokens:</strong> <em>{userData?.purchasedTokens}</em>
                </li>
                <li>
                  <strong>Destination Blockchain Network:</strong> <em>{userData?.destinationBlockchain}</em>
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

export default UserRegistration;
