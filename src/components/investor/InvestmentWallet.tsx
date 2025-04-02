import React, { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { readBonds } from "../../features/bondSlice";
import { PaymentRecord } from "../issuer/EnterpriseWallet";
import { useNavigate } from "react-router-dom";
import { generatePaymentRecords } from "../../utils";

const InvestmentWallet: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const bonds = useAppSelector((state) => state.bond.bonds);
  const [record, setRecord] = useState<PaymentRecord[]>([]);
  const [clipboardCopy, setClipboardCopy] = useState("");

  const handleCopy = (e: React.MouseEvent<HTMLParagraphElement>) => {
    setClipboardCopy(e.currentTarget.innerText);
    console.log(clipboardCopy);
    navigator.clipboard.writeText(clipboardCopy);
  };

  useEffect(() => {
    dispatch(readBonds());
    console.log(bonds);
  }, [bonds, dispatch]);

  useEffect(() => {
    const rec = generatePaymentRecords(bonds!);
    setRecord(rec);
    console.log(record);
  }, [bonds, record]);

  return (
    <div className="card mt-4" style={{ position: "relative", padding: "20px" }}>
      <h2 className="mb-3">MY INVESTMENT WALLET</h2>
      <h3 className="section-title">Your Wallet Address:</h3>
      <div className="wallet-address col-12">
        <p id="copyLabel" className="copy-label" onClick={handleCopy}>
          Wallet address
          <img src="/src/clip.png" id="copyButton" className="copy-button" />
        </p>
      </div>

      <div>
        <h3 className="section-title mt-4">Account Balance:</h3>
        <strong>Total Available Balance:</strong> 50.000€
      </div>

      <h3 className="section-title mt-4">Token List:</h3>
      {bonds?.map((bond) => (
        <Fragment key={bond._id}>
          <h4
            data-bs-toggle="collapse"
            data-bs-target={`#tokens-collapse-${bond._id}`}
            role="button"
            aria-expanded="false"
            aria-controls={`tokens-collapse-${bond._id}`}>
            <strong>{bond.bondName} Tokens in circulation:</strong> {bond.numberTokens}
          </h4>
          <div className="collapse" id={`tokens-collapse-${bond._id}`}>
            <ul>
              {bond.tokenState.map((block) => (
                <li key={`${bond._id}-${block.blockchain}`}>
                  <strong>{block.blockchain}:</strong> {block.amount}
                </li>
              ))}
            </ul>
          </div>
        </Fragment>
      ))}

      <h3 className="section-title mt-4">Upcoming payments</h3>
      <table
        border={1}
        style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", backgroundColor: "#d9e8fc" }}>
        <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
          <tr>
            <th>Bond Name</th>
            <th>Payment Date</th>
            <th>Payment Amount</th>
          </tr>
        </thead>
        <tbody>
          {record?.map((bond, index) => (
            <tr key={index}>
              <td>{bond.bondName}</td>
              <td>{bond.paymentDate}</td>
              <td>{bond.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="position-absolute top-0 end-0 m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button
          type="button"
          className="btn btn-primary col-sm-2"
          onClick={() => navigate("/issuer-dash")}
          style={{ backgroundColor: "aliceblue", color: "#0d6efd", width: "90px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InvestmentWallet;
