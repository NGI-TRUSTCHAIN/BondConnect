import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { readBonds } from "../../features/bondSlice";
import { useNavigate } from "react-router-dom";

const ManageBonds = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const bonds = useAppSelector((state) => state.bond.bonds);
  useEffect(() => {
    dispatch(readBonds());
  }, [dispatch]);

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light"
      style={{ width: "100vw", height: "100vh", backgroundColor: "#f8f9fa" }}>
      <div className="card shadow-lg p-5" style={{ width: "75%", margin: "auto" }}>
        <h1 className="text-primary text-center mb-5 fw-bold">MANAGE MY BONDS</h1>

        <div className="d-flex justify-content-center gap-5 mb-5 ms-4">
          <button className="btn btn-primary btn-lg p-3" onClick={() => navigate("/add-to-market")}>
            ADD TO RETAIL MARKET
          </button>
          <button className="btn btn-primary btn-lg p-3" onClick={() => navigate("/investor-registration")}>
            ADD INVESTOR
          </button>
          <button className="btn btn-outline-primary btn-lg p-3" onClick={() => navigate("/holder-list")}>
            INVESTOR LIST
          </button>
        </div>

        <h2 className="text-secondary fst-italic text-center mb-4">Available Bonds in my Wallet:</h2>

        <table className="table table-bordered text-center">
          <thead className="table-primary">
            <tr>
              <th className="p-3">"Bond Name"</th>
              <th className="p-3">"DLT Network"</th>
              <th className="p-3">"Amount of Tokens"</th>
            </tr>
          </thead>
          <tbody>
            {bonds?.map((bond, index) => (
              <tr key={index} className="bg-light">
                <td className="p-3 fst-italic">"{bond.bondName}"</td>
                <td className="p-3">{bond.blockchainNetwork}</td>
                <td className="p-3 fst-italic">{bond.numberTokens}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="container-md row m-3" style={{ display: "flex", justifyContent: "end", gap: "20px" }}>
          <button
            type="button"
            className="btn btn-primary col-sm-2"
            onClick={() => navigate("/issuer-dash")}
            style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageBonds;
