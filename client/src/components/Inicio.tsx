import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="container mt-3 ">
        <div className="card mt-3 d-flex justify-content-center align-items-center" style={{ minWidth: "100vh" }}>
          <div className="position-absolute top-0 end-0 m-3">
            <button className="btn btn-primary me-2" onClick={() => navigate('/user-registration')}>Sign Up</button>
            <button className="btn btn-outline-primary" onClick={() => navigate('/user-access')}>Access</button>
          </div>
          <h1 className="text-primary m-5">BondConnect</h1>
          <div className="container-md d-flex flex-column align-items-center">
            <button className="btn btn-primary btn-rad mb-2 p-3 col-9" onClick={() => navigate("/form")}>
              EXPLORE OPORTUNITIES
            </button>
            
            {/* <button className="btn btn-primary btn-rad mb-2 p-3 col-9" onClick={() => navigate("/form")}>
              TOKENIZED BOND CREATION
            </button>
            <button className="btn btn-primary btn-rad mb-2 p-3 col-9" onClick={() => navigate("/transfer")}>
              INTER-BLOCKCHAIN TRANSFER
            </button>
            <button className="btn btn-primary btn-rad mb-2 p-3 col-9" onClick={() => navigate("/payment-management")}>
              PAYMENT MANAGEMENT
            </button>
            <button className="btn btn-primary btn-rad mb-2 p-3 col-9" onClick={() => navigate("/management-menu")}>
              WALLET
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Inicio;
