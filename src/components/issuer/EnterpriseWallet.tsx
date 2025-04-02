import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { readBonds } from "../../features/bondSlice";
import "../components.css";
import { useNavigate } from "react-router-dom";
import { generatePaymentRecords } from "../../utils";

export interface PaymentRecord {
  bondName: string;
  paymentDate: string; // Fecha de cobro
  amount: number;
}


const EnterpriseWallet = () => {
  const [clipboardCopy, setClipboardCopy] = useState("");
  const [record, setRecord] = useState<PaymentRecord[]>([]);
  const [visibleCount, setVisibleCount] = useState(5); // Número inicial de registros visibles

  const bonds = useAppSelector((state) => state.bond.bonds);

  const dispatch = useAppDispatch();
  const navigate = useNavigate()

  // Reads the available bonds
  useEffect(() => {
    dispatch(readBonds());
  }, [dispatch]);

  // Creates an interface for the object array record to render a table with the payment
  // records

  useEffect(() => {
    const rec = generatePaymentRecords(bonds!)
    setRecord(rec)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (e: React.MouseEvent<HTMLParagraphElement>) => {
    setClipboardCopy(e.currentTarget.innerText);
    console.log(clipboardCopy);
    navigator.clipboard.writeText(clipboardCopy);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5); // Incrementa el número de registros visibles
  };

  return (
    <>
      <div className="card mt-4" style={{ position: "relative", padding: "20px" }}>
        <div className="position-absolute top-0 end-0 m-3" style={{ display: "flex", justifyContent: "end" }}>
          <button
            type="button"
            className="btn btn-primary col-sm-2"
            onClick={() => navigate("/issuer-dash")}
            style={{ backgroundColor: "aliceblue", color: "#0d6efd", width: '90px'}}>
            Cancel
          </button>
        </div>
        <h2 className="mb-3">ENTERPRISE WALLET</h2>

        <h3 className="section-title">Your Wallet Address:</h3>
        <div className="wallet-address col-12">
          <p id="copyLabel" className="copy-label" onClick={handleCopy}>
            Wallet address
            <img src="/src/clip.png" id="copyButton" className="copy-button" />
          </p>
        </div>

        <h3 className="section-title mt-4">Overview of Balance</h3>
        <h4
          data-bs-toggle="collapse"
          data-bs-target="#balance-collapse"
          role="button"
          aria-expanded="false"
          aria-controls="balance-collapse">
          <strong>Total Available Balance:</strong> 50.000€
        </h4>
        <div className="collapse" id="balance-collapse">
          <ul>
            <li>
              <strong>Alastria:</strong> 20.000€
            </li>
            <li>
              <strong>Ethereum:</strong> 20.000€
            </li>
            <li>
              <strong>Polygon:</strong> 10.000€
            </li>
          </ul>
        </div>

        <h3 className="section-title mt-4">Tokens in circulation</h3>

        {/* <h4 data-bs-toggle="collapse" data-bs-target="#tokens-collapse" role="button" aria-expanded="false" aria-controls="tokens-collapse">
                <strong>“Bond 1” Tokens in circulation:</strong> “5.000” 
            </h4>
            <div className="collapse" id="tokens-collapse">
                <ul>
                    <li><strong>Alastria:</strong> 2000</li>
                    <li><strong>Ethereum:</strong> 2000</li>
                    <li><strong>Polygon:</strong> 1000</li>
                </ul>
            </div>   */}

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
            {/* <tr>
                        <td>Bond 1</td>
                        <td>01/01/2026</td>
                        <td>20.000€</td>
                    </tr> */}
            {record.slice(0, visibleCount).map((record: PaymentRecord) => (
              <tr key={record.paymentDate}>
                <td>{record.bondName}</td>
                <td>{record.paymentDate}</td>
                <td>{record.amount} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleCount < record.length && ( // Muestra el botón si hay más registros
          <button onClick={handleShowMore}>Show More</button>
        )}
      </div>
    </>
  );
};

export default EnterpriseWallet;
