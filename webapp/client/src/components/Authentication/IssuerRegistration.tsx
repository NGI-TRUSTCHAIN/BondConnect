import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerInvestor, registerIssuer } from "../../features/userSlice";
import { europeanCountries } from "../../utils";
import { Investor } from "./InvestorRegistration";

export interface Issuer {
  _id: string | undefined;
  entityLegalName: string;
  country: string;
  taxIdNumber: string;
  website: string;
  name: string;
  surname: string;
  idCard: string;
  email: string;
  password: string;
  // Añadir walletAddress
}

type Props = {
  investor?: boolean;
};

/** Si investor es true, la empresa se registrara como inversora.
 *  Si es false, la empresa se listara como emisara
 */
const IssuerRegistration: React.FC<Props> = ({ investor = false }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [pass, setPass] = useState("");
  const [confimPass, setConfirmPass] = useState("");
  const [errorPass, setErrorPass] = useState(false);
  const [user, setUser] = useState<Issuer | Investor | null>(null);
  const error = useAppSelector((state) => state.user.error)
  const [issuer, setIssuer] = useState<Issuer>({
    _id: undefined,
    entityLegalName: "",
    country: "",
    taxIdNumber: "",
    website: "",
    name: "",
    surname: "",
    idCard: "",
    email: "",
    password: "",
  });


  useEffect(() => {
    console.log(error);
    
  }, [error])
  


  useEffect(() => {
    if (pass === confimPass && pass !== "") {
      setIssuer((prevState) => ({
        ...prevState,
        password: pass, // Actualizamos el password
      }));
    }
  }, [pass, confimPass]);

  useEffect(() => {
    console.log(user);
    
    if (investor && user?._id) {
      navigate("/investor-dash", { state: { user } });
    } 
    if (!investor && user?._id){
      navigate("/issuer-dash", { state: { user } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  

  const handleData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIssuer((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSelectData = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIssuer((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pass !== "" && confimPass !== "") {
      if (pass === confimPass) {
        console.log(issuer, investor);
        setErrorPass(false);
        if (investor) {
          const user = await dispatch(registerInvestor({ investor: issuer, particular: false })).unwrap()
          setUser(user);
        } else {
          const user = await dispatch(registerIssuer(issuer)).unwrap()
          setUser(user);
        }
      } else {
        console.log("Data not ok", "Password don't match");
        setErrorPass(true);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container row mt-4" style={{ textAlign: "left" }}>
      <h2 className="text-primary mb-4" style={{ textAlign: "center" }}>
        ISSUER REGISTRATION
      </h2>

      <h4 className="text-primary mt-4">Entity Information</h4>
      <div className="col-sm-6 mb-3">
        <label htmlFor="entityLegalName" className="form-label">
          Entity Full Legal Name:
        </label>
        <input
          type="text"
          id="entityLegalName"
          name="entityLegalName"
          className="form-control bg-form"
          placeholder={`Company's name`}
          onChange={handleData}
        />
      </div>
      <div className="col-sm-6 mb-3">
        <label htmlFor="taxIdNumber" className="form-label">
          Tax ID Number:
        </label>
        <input
          type="text"
          id="taxIdNumber"
          name="taxIdNumber"
          className="form-control bg-form"
          placeholder={`Tax ID Number`}
          onChange={handleData}
        />
      </div>
      <div className="col-sm-12 mb-3">
        <label htmlFor="website" className="form-label">
          Website:
        </label>
        <input
          type="text"
          id="website"
          name="website"
          className="form-control bg-form"
          placeholder={`Company's website`}
          onChange={handleData}
        />
      </div>
      <h4 className="text-primary mt-4">Legal representative</h4>
      <div className="col-sm-4 mb-3">
        <label htmlFor="name" className="form-label">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control bg-form"
          placeholder={`Investor's name`}
          onChange={handleData}
        />
      </div>
      <div className="col-sm-4 mb-3">
        <label htmlFor="surname" className="form-label">
          Surname:
        </label>
        <input
          type="text"
          id="surname"
          name="surname"
          className="form-control bg-form"
          placeholder="Investor's surname"
          onChange={handleData}
        />
      </div>

      <div className="col-sm-4 mb-3">
        <label htmlFor="idCard" className="form-label">
          ID Card:
        </label>
        <input
          type="text"
          id="idCard"
          name="idCard"
          className="form-control bg-form"
          placeholder="ID Card"
          onChange={handleData}
        />
      </div>
      <div className="col-sm-6 mb-3">
        <label htmlFor="country" className="form-label">
          Country:
        </label>
        <select id="country" name="country" value={issuer.country} onChange={handleSelectData} className="form-control">
          <option value="" disabled hidden>
            Selecciona un país
          </option>
          {europeanCountries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div className="col-sm mb-3">
        <label htmlFor="email" className="form-label">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control bg-form"
          placeholder="Email"
          onChange={handleData}
        />
      </div>

      <div className="col-sm-6 mb-3">
        <label htmlFor="password" className="form-label">
          Password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control bg-form"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
      </div>
      <div className="col-sm-6 mb-3">
        <label htmlFor="password" className="form-label">
          Confirm Password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control bg-form"
          placeholder="Confirm password"
          value={confimPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />
      </div>
      {errorPass && <p className="text-danger">Password doesn't match</p>}
      <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button type="submit" className="btn btn-primary col-sm-4" style={{ alignItems: "right" }}>
          Confirm
        </button>
        <button
          type="button"
          className="btn btn-primary col-sm-2"
          onClick={() => navigate("/")}
          style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default IssuerRegistration;
