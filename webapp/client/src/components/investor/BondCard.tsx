import React from "react";
import { Bond } from "../../Bond";
import { useNavigate } from "react-router-dom";
import { Investor } from "../Authentication/InvestorRegistration";

const BondCard: React.FC<{ bond: Bond, user: Investor }> = ({ bond, user }) => {
  const navigate = useNavigate()
  return (
    <div className="bond-card" style={{width: 'fit-content'}}>
      <div className="card-body pt-0">
        <p className="card-title" style={{ color: "#007bff", marginBottom: "1rem" }}>
          {bond.bondName} - {bond.blockchainNetwork}
        </p>
        <ul className="text-start p-0">
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Investment Period:</strong> {(new Date(bond.bondMaturityDate!).getFullYear() - new Date(bond.bondStartDate!).getFullYear())} years
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Anual interst rate:</strong> {bond.interestRate} %
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Price:</strong> {bond.price?.toFixed(2)} €
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Start date:</strong> {new Date(bond.bondStartDate!).toLocaleDateString("es-ES")}
          </li>
        </ul>

        <button className="btn btn-primary-sm" onClick={() => navigate(`/bond-details/${bond._id}`,  { state: { bond, user } })} style={{ backgroundColor: "#007bff", color: "white" }}>
          See More
        </button>
      </div>
    </div>
  );
};

export default BondCard;
