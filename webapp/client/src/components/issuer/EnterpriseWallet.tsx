import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { readBonds } from "../../features/bondSlice";
import "../components.css";
import { useNavigate } from "react-router-dom";
import { getTokenListAndUpcomingPaymentsByIssuer } from "../../features/bondSlice";

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
  const tokenList = useAppSelector((state) => state.bond.tokenList);
  const upcomingPayment = useAppSelector((state) => state.bond.upcomingPayment);
  console.log("tokenList: ",tokenList);
  console.log("upcomingPayment: ",upcomingPayment);

  const dispatch = useAppDispatch();
  const navigate = useNavigate()

  const userId = useAppSelector((state) => state.user.userLoged?._id);
  const wallet = useAppSelector((state) => state.user.userLoged?.walletAddress);

  const priceTotal = tokenList?.reduce((acc, token) => {
    if (!acc[token.network]) {
      acc[token.network] = [];
    }
    acc[token.network].push(token.amountAvaliable || 0);
    return acc;
  }, {} as Record<string, number[]>);

  // Calcular suma por red
  const sumByNetwork = priceTotal ? Object.entries(priceTotal).reduce((acc, [network, values]) => {
    acc[network] = values.reduce((sum, value) => sum + value, 0);
    return acc;
  }, {} as Record<string, number>) : {};

  // Calcular total general
  const totalSum = Object.values(sumByNetwork).reduce((sum, value) => sum + value, 0);
  
  // Reads the available bonds
  useEffect(() => {
    dispatch(readBonds(userId || ""));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTokenListAndUpcomingPaymentsByIssuer(userId || ""));
  }, [dispatch]);

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
            {wallet}
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
          <strong>Total Available Balance:</strong> {totalSum}
        </h4>
        <div className="collapse" id="balance-collapse">
          <ul>
            <li>
              <strong>Alastria:</strong> {sumByNetwork.ALASTRIA}
            </li>
            <li>
              <strong>Amoy:</strong> {sumByNetwork.AMOY}
            </li>
          </ul>
        </div>

        <h3 className="section-title mt-4">Tokens in circulation</h3>

          <table
          border={1}
          style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", backgroundColor: "#d9e8fc" }}>
          <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
            <tr>
              <th>Bond Name</th>
              <th>DLT Network</th>
              <th>Amount of Tokens</th>
            </tr>
          </thead>
          <tbody>
            {tokenList?.map((token) => (
              <tr key={token.bondName}>
                <td>{token.bondName}</td>
                <td>{token.network}</td>
                <td>{token.amountAvaliable}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <h3 className="section-title mt-4">Upcoming payments</h3>
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
        )} */}
      </div>
    </>
  );
};

export default EnterpriseWallet;
