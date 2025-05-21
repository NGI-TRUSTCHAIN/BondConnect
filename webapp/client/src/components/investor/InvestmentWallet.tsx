import React, { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { readBonds } from "../../features/bondSlice";
import { getInvestorWalletData, getFaucetBalance } from "../../features/userSlice";
import { PaymentRecord } from "../issuer/EnterpriseWallet";
import { data, useNavigate } from "react-router-dom";
import { generatePaymentRecords } from "../../utils";
import { getTokenListAndUpcomingPaymentsByInvestor } from "../../features/bondSlice";

const InvestmentWallet: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const bonds = useAppSelector((state) => state.bond.bonds);
  const user = useAppSelector((state) => state.user.userLoged);
  const userId = user?._id;
  const [record, setRecord] = useState<PaymentRecord[]>([]);
  // const [walletData, setWalletData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [clipboardCopy, setClipboardCopy] = useState("");
  const wallet = user?.walletAddress;
  const tokenList = useAppSelector((state) => state.bond.tokenList);
  const upcomingPayment = useAppSelector((state) => state.bond.upcomingPayment);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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

  const handleCopy = (e: React.MouseEvent<HTMLParagraphElement>) => {
    setClipboardCopy(e.currentTarget.innerText);
    console.log(clipboardCopy);
    navigator.clipboard.writeText(clipboardCopy);
  };

  useEffect(() => {
    dispatch(getTokenListAndUpcomingPaymentsByInvestor(userId || ""))
      .then(() => {
        setIsDataLoaded(true);
      });
  }, [dispatch]);

  useEffect(() => {
    dispatch(readBonds(userId || ""));
    
    const fetchData = async () => {
      try {
        console.log(userId + " USER ID");
        // const data = await dispatch(getInvestorWalletData(userId || "")).unwrap();
        // setWalletData(data);
        console.log(user?.walletAddress + " WALLET DATA");

          const dataFaucet = await dispatch(getFaucetBalance(user?.walletAddress!)).unwrap();
          console.log(dataFaucet + " BALANCE");
          setBalanceData(dataFaucet);
        
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const rec = generatePaymentRecords(bonds!);
    setRecord(rec);
    console.log(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card mt-4" style={{ position: "relative", padding: "20px" }}>
      <h2 className="mb-3">MY INVESTMENT WALLET</h2>
      <h3 className="section-title">Your Wallet Address:</h3>
      <div className="wallet-address col-12">
        <p id="copyLabel" className="copy-label" onClick={handleCopy}>
          {wallet}
          <img src="/src/clip.png" id="copyButton" className="copy-button" />
        </p>
      </div>

      <div>
        <h3 className="section-title mt-4">Account Balance:</h3>
        <strong>Total Available Balance:</strong> {balanceData}
      </div>
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

      <h3 className="section-title mt-4">Token List:</h3>
      {tokenList?.map((token) => (
        <div key={token.bondName} className="mb-2">
          <strong>"{token.bondName}" Tokens in circulation:</strong> {token.price}
        </div>
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
          onClick={() => navigate(-1)}
          style={{ backgroundColor: "aliceblue", color: "#0d6efd", width: "90px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InvestmentWallet;
