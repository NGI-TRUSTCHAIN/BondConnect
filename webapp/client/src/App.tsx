import "./App.css";
import { Route, Routes } from "react-router-dom";
import Inicio from "./components/Inicio";
import FormBondCreationC from "./components/issuer/FormBondCreationC";
import BlockchainTransfer from "./components/issuer/BlockchainTransfer";
import EnterpriseWallet from "./components/issuer/EnterpriseWallet";
import PaymentManagement from "./components/issuer/PaymentManagement";
import HolderList from "./components/issuer/HolderList";
import TokenSale from "./components/TokenSale";
import TokenSettlement from "./components/TokenSettlement";
import SignUp from "./components/Authentication/SignUp";
import SignIn from "./components/Authentication/SignIn";
import IssuerIndex from "./components/issuer/IssuerIndex";
import Oportunities from "./components/investor/Oportunities";
import BondDetails from "./components/investor/BondDetails";
import ManageBonds from "./components/issuer/ManageBonds";
import UserRegistration from "./components/UserRegistration";
import RetailMarket from "./components/issuer/RetailMarket";
import InvestmentWallet from "./components/investor/InvestmentWallet";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/user-access" element={<SignIn />} />
      <Route path="/user-registration" element={<SignUp />} />
      <Route path="/issuer-dash" element={<IssuerIndex />} />
      <Route path="/form" element={<FormBondCreationC />} />
      <Route path="/manage-bonds" element={<ManageBonds />} />
      <Route path="/add-to-market" element={<RetailMarket />} />
      <Route path="/investor-registration" element={<UserRegistration />} />
      <Route path="/holder-list" element={<HolderList />} />
      <Route path="/transfer" element={<BlockchainTransfer />} />
      <Route path="/management-menu" element={<EnterpriseWallet />} />
      <Route path="/payment-management" element={<PaymentManagement />} />
      <Route path="/tokenSale" element={<TokenSale />} />
      <Route path="/tokenSettlement" element={<TokenSettlement />} />
      <Route path="/investor-dash" element={<Oportunities />} />
      <Route path="/investor-wallet" element={<InvestmentWallet />} />
      <Route path="/bond-details/:id" element={<BondDetails />} />
    </Routes>
  );
}

export default App;
