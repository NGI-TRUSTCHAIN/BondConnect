import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerInvestor } from "../../features/userSlice";
import { europeanCountries } from "../../utils";
import "react-toastify/dist/ReactToastify.css";

export interface Investor {
  _id: string | undefined;
  name: string;
  surname: string;
  idCard: string;
  country: string;
  email: string;
  password: string;
  walletAddress: string;
  accounts: any;
}

const InvestorRegistration = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<Investor>({
    _id: undefined,
    name: "",
    surname: "",
    idCard: "",
    country: "",
    email: "",
    password: "",
    walletAddress: "",
    accounts: {},
  });
  const [pass, setPass] = useState("");
  const [confimPass, setConfirmPass] = useState("");
  const [errorPass, setErrorPass] = useState(false);
  const error = useAppSelector((state) =>  state.user.error) 


  useEffect(() => {
    if (pass === confimPass && pass !== "") {
      setInvestor((prevState) => ({
        ...prevState,
        password: pass, // Actualizamos el password
      }));
    }
  }, [pass, confimPass]);

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);
  useEffect(() => {
    if (investor._id) {
      navigate("/investor-dash");
    }
  }, [investor._id, navigate]);

  const handleData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvestor((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSelectData = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvestor((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const isInvestorValid = (investor: Investor) => {
    return Object.entries(investor).every(([key, value]) => {
      if (key === "_id" || key === "walletAddress" || key === "accounts") return true; // Ignorar _id, wallet y accounts
      return value !== "" && value !== undefined;
    });
  };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (pass !== confimPass || pass === "") {
  //     console.log("Data not ok", "Password don't match");
  //     setErrorPass(true);
  //     return;
  //   }

  //   console.log(investor);
    
  //   if (!isInvestorValid(investor)) {
  //     console.log("Error: Todos los campos deben estar completos.");
  //     return;
  //   }

  //   console.log("Enviando datos:", investor);
  //   const user = await dispatch(registerInvestor({ investor, particular: true })).unwrap();
  //   console.log("Usuario creado:", user);
  //   setInvestor(user); // Actualizar el estado solo si el usuario tiene un ID
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (pass !== confimPass || pass === "") {
      setErrorPass(true);
      console.log("Error: Passwords don't match");
      return;
    }
  
    if (!isInvestorValid(investor)) {
      console.log(" Error: Todos los campos deben estar completos.");
      return <p>Todos los campos deben estar completos.</p>;
    }  
    try {
      console.log("🚀 Enviando datos:", investor);
      const user = await dispatch(registerInvestor({ investor, particular: true })).unwrap();
      console.log("Usuario creado:", user);
      setInvestor(user);
    } catch (error) {
      console.error("Error en el registro:", error);
    }
  };

  
  return (
    // <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
    //   <div className="card mt-3">
    <form onSubmit={handleSubmit} className="container row mt-4" style={{ textAlign: "left" }}>
      <h2 className="text-primary mb-4" style={{ textAlign: "center" }}>
        INVESTOR REGISTRATION
      </h2>
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
      {/* Investor Surname */}
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

      {/* ID Card */}
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
          value={investor.idCard}
          onChange={handleData}
        />
      </div>
      <div className="col-sm-6 mb-3">
        <label htmlFor="country" className="form-label">
          Country:
        </label>
        <select
          id="country"
          name="country"
          value={investor.country}
          onChange={handleSelectData}
          className="form-control">
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
      {/* Email */}
      <div className="col-sm-6 mb-3">
        <label htmlFor="email" className="form-label">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control bg-form"
          placeholder="Email"
          value={investor.email}
          onChange={handleData}
        />
      </div>

      {/* Password */}
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
          // onClick={() => navigate("/")}
          style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
          Cancel
        </button>
      </div>
    </form>
    //   </div>
    // </div>
  );
};

export default InvestorRegistration;
