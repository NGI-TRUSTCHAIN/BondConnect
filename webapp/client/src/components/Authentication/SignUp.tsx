import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvestorRegistration from "./InvestorRegistration";
import IssuerRegistration from "./IssuerRegistration";


const SignUp = () => {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState("");
  const [investorType, setInvestorType] = useState("");

  useEffect(() => {
    document.title = "Register User";
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(userProfile);
  };
  
  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3">
        <form className="container row mt-4" style={{ textAlign: "left" }}>
          <h2 className="text-primary mb-4" style={{ textAlign: "center" }}>
            USER REGISTRATION
          </h2>

          <div className="col-sm mb-3 d-flex justify-content-space-beetwen ">
            <label className="form-label">User Profile:</label>
            <div className="form-check pr-4" style={{marginRight: '20px', marginLeft: '20px'}}>
              <input
                type="radio"
                id="investor"
                name="userProfile"
                value="investor"
                className="form-check-input"
                checked={userProfile === "investor"}
                onChange={(e) => setUserProfile(e.target.value)}
              />
              <label className="form-check-label" htmlFor="investor">
                Investor
              </label>
            </div>
            <div className="form-check mr-4" style={{marginRight: '20px', marginLeft: '20px'}}>
              <input
                type="radio"
                id="issuer"
                name="userProfile"
                value="issuer"
                className="form-check-input"
                checked={userProfile === "issuer"}
                onChange={(e) => setUserProfile(e.target.value)}
              />
              <label className="form-check-label" htmlFor="issuer">
                Issuer
              </label>
            </div>
          </div>

          {userProfile === 'investor' && <div className="row">
            <div className="col-sm mb-3 d-flex justify-content-space-beetwen ">
              <label className="form-label">Tipo:</label>
              <div className="form-check pr-4" style={{marginRight: '20px', marginLeft: '20px'}}>
                <input
                  type="radio"
                  id="particular"
                  name="investorType"
                  value="particular"
                  className="form-check-input"
                  checked={investorType === "particular"}
                  onChange={(e) => setInvestorType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="particular">
                  Individual
                </label>
              </div>
              <div className="form-check mr-4" style={{marginRight: '20px', marginLeft: '20px'}}>
                <input
                  type="radio"
                  id="empresa"
                  name="investorType"
                  value="empresa"
                  className="form-check-input"
                  checked={investorType === "empresa"}
                  onChange={(e) => setInvestorType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="issuer">
                  Enterprise
                </label>
              </div>
            </div>
          </div>}

          {userProfile === '' && investorType === '' &&
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
              onClick={() => navigate("/")}
              style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
              Cancel
            </button>
          </div>}
        </form>
        {userProfile === 'investor' && investorType === 'particular' && <InvestorRegistration/>}
        {userProfile === 'investor' && investorType === 'empresa' && <IssuerRegistration investor/>}
        {userProfile === 'issuer' && <IssuerRegistration/>}
      </div>
    </div>
  );
};

export default SignUp;
