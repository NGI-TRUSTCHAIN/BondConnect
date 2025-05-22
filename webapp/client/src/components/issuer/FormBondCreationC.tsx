import React, { useEffect, useState } from "react";
import { Bond } from "../../Bond";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import { newBond, saveBond } from "../../features/bondSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormBondCreationC = () => {
  // const dispatch = useAppDispatch();
  const errorMessage = useAppSelector((state) => state.bond.error);
  const user = useAppSelector((state) => state.user.userLoged);
  const navigate = useNavigate();

  const bonds = useAppSelector((state) => state.bond.bonds);
  const [errors, setErrors] = useState<{ bondName?: string; bondSymbol?: string }>({});

  // Define the state to manage form inputs
  const [formData, setFormData] = useState<Bond>({
    _id: undefined,
    bondName: "",
    bondSymbol: "",
    bondStartDate: new Date(),
    bondMaturityDate: undefined,
    bondPurpose: "",
    interestRate: undefined,
    paymentFreq: "Annualy",
    goalAmount: undefined,
    numberTokens: undefined,
    price: 0,
    earlyRedemptionClauses: "no",
    penalty: undefined,
    // redemptionPeriods: "",
    redemptionStartDate: undefined,
    redemptionFinishDate: undefined,
    blockchainNetwork: "ALASTRIA",
    // walletAddress: "",
    tokenState: [],
    creatorCompany: user?._id,
  });

  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const dispatch = useAppDispatch();

  const handleConfirmSubmit = async () => {
    const tokenState = [
      {
        blockchain: formData.blockchainNetwork,
        amount: formData.numberTokens!,
      },
    ];
    console.log(tokenState);
    const price = formData.goalAmount! / formData.numberTokens!;
    const bond: Bond = {
      ...formData,
      tokenState,
      price,
    };
    try {
      console.log("Form data submitted:", bond);
      await dispatch(newBond(bond)).unwrap(); // Dispatch the data
      toast.success("Bond created successfully!");
    } catch (error) {
      toast.error(`Failed to create bond. Please try again.\n ${error}`);
    } finally {
      setShowPopup(false); // Close the popup
      // navigate('/')
    }
  };

  const handleSaveBond = async () => {
    try {
      console.log("Form data submitted:", formData);
      await dispatch(saveBond(formData)).unwrap(); // Dispatch the data
      toast.success("Draft created successfully!");
    } catch (error) {
      toast.error(`Failed to save draft.\n Erorr: ${error}`);
    }
  };

  const validateUniqueness = (field: "bondName" | "bondSymbol", value: string) => {
    const normalizedValue = value.trim().toLowerCase();
    return !bonds!.some((bond) => bond[field]?.trim().toLowerCase() === normalizedValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "bondName" || name === "bondSymbol") {
      const isUnique = validateUniqueness(name, value);

      if (!isUnique) {
        setErrors((prev) => ({
          ...prev,
          [name]: `${name === "bondName" ? "Bond name" : "Bond symbol"} already exists.`,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  useEffect(() => {
    document.title = "Register Bond";
    if (errorMessage !== null) {
      console.log(errorMessage);
    } else {
      // navigate("/dashboard", {state:{email}})
    }
  }, [errorMessage]);

  // Handle input changes and update the state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; // Extract name and value from the event
    //setFormData({ ...formData, [name]: value }); // Update state dynamically
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "bondMaturityDate" || name === "bondStartDate" || name === "redemptionFinishDate"
          ? new Date(value) // Convierte cadena a Date
          : name === "walletAddress"
          ? value // No convertir walletAddress
          : value
          ? value
          : value, // Convierte a número si es posible
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log("Form data submitted:", formData); // Log the form data
    setShowPopup(true); // Show the confirmation popup on form submission
    // await dispatch(newBond(formData))
    // navigate("/confirm", { state: { formData } });
  };

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3" style={{ width: "75%" }}>
        <form className="container mt-4" style={{ textAlign: "left" }} onSubmit={handleSubmit}>
          <h2 className="text-primary" style={{ textAlign: "center" }}>
            TOKENIZED BOND CREATION
          </h2>

          {/* Section 1.1: Basic Bond Information */}
          <div className="container-md m-3">
            <h4 className="text-primary">Basic Bond Information</h4>
            <div className="row">
              <div className="col-8 mb-3">
                <label htmlFor="bondName" className="form-label">
                  Enter Name:
                </label>
                <input
                  type="text"
                  id="bondName"
                  name="bondName"
                  className="form-control bg-form"
                  placeholder="E.g., SME Bond 2024"
                  value={formData.bondName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>{errors.bondName && <div className="invalid-feedback">{errors.bondName}</div>}
              <div className="col-4 mb-3">
                <label htmlFor="bondSymbol" className="form-label">
                  Enter Name:
                </label>
                <input
                  type="text"
                  id="bondSymbol"
                  name="bondSymbol"
                  className="form-control bg-form"
                  placeholder="E.g., SME-24"
                  value={formData.bondSymbol}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>{errors.bondSymbol && <div className="invalid-feedback">{errors.bondSymbol}</div>}
              <div className="mb-3">
                <label htmlFor="bondPurpose" className="form-label">
                  Bond Purpose:
                </label>
                <textarea
                  name="bondPurpose"
                  rows={2}
                  className="form-control bg-form"
                  id="bondPurpose"
                  placeholder="Reason to create the bond token"
                  value={formData.bondPurpose}
                  onChange={handleChange}></textarea>
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="bondStartDate" className="form-label">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="bondStartDate"
                  name="bondStartDate"
                  className="form-control bg-form"
                  value={formData.bondStartDate ? formData.bondStartDate.toISOString().split("T")[0] : ""}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-6 mb-3">
                // Tiene que ser minimo un año despues de bondStartDate
                <label htmlFor="bondMaturityDate" className="form-label">
                  Maturity Date:
                </label>
                <input
                  type="date"
                  id="bondMaturityDate"
                  name="bondMaturityDate"
                  className="form-control bg-form"
                  value={formData.bondMaturityDate ? formData.bondMaturityDate.toISOString().split("T")[0] : ""}
                  min={formData.bondStartDate ? new Date(formData.bondStartDate.getTime() + 365*24*60*60*1000).toISOString().split("T")[0] : ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 1.2: Financial Parameters */}
          <div className="container-md m-3">
            <h4 className="text-primary">Financial Parameters</h4>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="interestRate" className="form-label">
                  Annual Interest Rate:
                </label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  className="form-control bg-form"
                  placeholder="7%"
                  value={formData.interestRate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="paymentFreq" className="form-label">
                  Coupon Payment Frequency:
                </label>
                <select
                  id="paymentFreq"
                  name="paymentFreq"
                  className="form-control bg-form"
                  value={formData.paymentFreq}
                  onChange={handleChange}
                  disabled>
                  <option value="Annualy" disabled>Annually</option>
                </select>
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="goalAmount" className="form-label">
                  Total Amount to Raise:
                </label>
                <input
                  type="number"
                  id="goalAmount"
                  name="goalAmount"
                  className="form-control bg-form"
                  placeholder="1.000.000€"
                  value={formData.goalAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="numberTokens" className="form-label">
                  Number of Tokens:
                </label>
                <input
                  type="number"
                  id="numberTokens"
                  name="numberTokens"
                  className="form-control bg-form"
                  placeholder="10.000"
                  value={formData.numberTokens}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 1.3: Advanced Options */}
          {/* <div className="container-md m-3">
            <h4 className="text-primary">1.3 Advanced Options</h4>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="earlyRedemptionClauses" className="form-label">
                  Early Redemption Clauses:
                </label>
                <select
                  id="earlyRedemptionClauses"
                  name="earlyRedemptionClauses"
                  className="form-control bg-form"
                  value={formData.earlyRedemptionClauses}
                  onChange={handleChange}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {formData.earlyRedemptionClauses === "yes" && (
                // Conditional rendering for early redemption details
                <>
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="penalty" className="form-label">Penalty:</label>
                    <input type="number" id="penalty" name="penalty" className="form-control bg-form"
                      placeholder="2%"value={formData.penalty}onChange={handleChange}/>
                  </div>
                  <div className="col-sm-6 mb-3"> 
                    Esto esta comentado desde
                    <label htmlFor="redemptionPeriods" className="form-label">Redemption Periods:</label>
                    <input type="text" id="redemptionPeriods" name="redemptionPeriods" className="form-control bg-form"
                      placeholder="dd/mm/YYYY to dd/mm/YYYY" value={formData.redemptionPeriods} onChange={handleChange}/>
                  hasta aqui</div>
                  
                  <div>Redemption Periods:</div>
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="redemptionStartDate" className="form-label">Start Date:</label>
                    <input type="date" id="redemptionStartDate" name="redemptionStartDate" className="form-control bg-form"
                      value={formData.redemptionStartDate ? formData.redemptionStartDate.toISOString().split("T")[0] : ""}
                      onChange={handleChange}/>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="redemptionFinishDate" className="form-label">Finish Date:</label>
                    <input type="date" id="redemptionFinishDate" name="redemptionFinishDate" className="form-control bg-form"
                      value={formData.redemptionFinishDate ? formData.redemptionFinishDate.toISOString().split("T")[0] : ""}
                      onChange={handleChange}/>
                  </div>
                </>
              )}
            </div>
          </div> */}

          {/* Section 1.4: Blockchain Network Selection */}
          <div className="container-md m-3">
            <h4 className="text-primary">DLT Network Selection</h4>
            <div className="row">
              <div className=" mb-3">
                <select
                  id="blockchainNetwork"
                  name="blockchainNetwork"
                  className="form-control bg-form"
                  value="ALASTRIA"
                  disabled>
                  <option value="ALASTRIA">Alastria</option>
                </select>
              </div>
            </div>
          </div>

          <ToastContainer />
          {/* Action Buttons */}
          <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button type="submit" className="btn btn-primary col-sm-2" style={{ alignItems: "right" }}>
              Confirm
            </button>
            {/* <button type="button" className="btn btn-primary col-sm-2">
              Back
            </button> */}
            <button
              type="button"
              className="btn btn-primary col-sm-2"
              onClick={handleSaveBond}
              style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
              Save
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
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              {/* <h2 className="text-primary mb-5" style={{ textAlign: 'center' }}>
                TOKENIZED BOND CREATION
              </h2> */}

              <h4 className="fst-italic text-secondary">Final Summary</h4>

              <h5 className="fw-bold fst-italic mt-4">Bond Details:</h5>
              <ul>
                <li>
                  <strong>Bond Name:</strong> <em>{formData.bondName}</em>
                </li>
                <li>
                  <strong>Bond Purpose:</strong> <em>{formData.bondPurpose}</em>
                </li>
              </ul>

              <h5 className="fw-bold fst-italic mt-4">Key Dates:</h5>
              <ul>
                <li>
                  <strong>Start Date:</strong>{" "}
                  <em>
                    {formData.bondStartDate instanceof Date
                      ? formData.bondStartDate.toLocaleDateString()
                      : formData.bondStartDate}
                  </em>
                </li>
                <li>
                  <strong>Maturity Date:</strong>{" "}
                  <em>
                    {formData.bondMaturityDate instanceof Date
                      ? formData.bondMaturityDate.toLocaleDateString()
                      : formData.bondMaturityDate}
                  </em>
                </li>
              </ul>

              <h5 className="fw-bold fst-italic mt-4">Financial Terms:</h5>
              <ul>
                <li>
                  <strong>Interest Rate:</strong> <em>{formData.interestRate}%</em>
                </li>
                <li>
                  <strong>Coupon Payment Frequency:</strong> <em>{formData.paymentFreq}</em>
                </li>
              </ul>

              <h5 className="fw-bold fst-italic mt-4">Tokenization Details:</h5>
              <ul>
                <li>
                  <strong>Number of Tokens:</strong> <em>{formData.numberTokens?.toLocaleString()}</em>
                </li>
                <li>
                  <strong>Nominal Value:</strong>{" "}
                  <em>
                    {formData?.goalAmount && formData?.numberTokens
                      ? (formData.goalAmount / formData.numberTokens).toFixed(2)
                      : "N/A"}{" "}
                    €
                  </em>
                </li>
                <li>
                  <strong>DLT of Issuance:</strong> <em>{formData.blockchainNetwork}</em>
                </li>
              </ul>

              <div className="popup-actions mt-5">
                <button className="btn btn-primary" onClick={handleConfirmSubmit}>
                  Create bond
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

export default FormBondCreationC;
