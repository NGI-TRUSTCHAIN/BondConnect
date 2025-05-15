import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect } from "react";
import { getRetailMktBonds, readBonds } from "../../features/bondSlice";
import BondCard from "./BondCard";

const Oportunities = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bonds = useAppSelector((state) => state.bond.bonds);
  const retailBonds = useAppSelector((state) => state.bond.retailBonds);
  const user = useAppSelector((state) => state.user.userLoged);

  const groupedMarketData = (retailBonds && retailBonds.length > 0) ?
  retailBonds?.reduce((acc, item) => {
    const key = item.investToken;
    const tokens = item.numTokensOffered ?? 0;
    const blockchain = item.destinationBlockchain;

    // Buscar si ya hay un objeto para este investToken
    let existing = acc.find((entry) => entry.investToken === key);

    if (!existing) {
      // Si no existe, se crea
      existing = {
        investToken: key,
        totalTokens: 0,
        blockchains: [] as { destinationBlockchain: string; numTokensOffered: number }[],
      };
      acc.push(existing);
    }

    // Sumar al total de tokens
    existing.totalTokens += tokens;
    // Buscar si ya existe esta blockchain
    const existingBlockchain = existing.blockchains.find((b) => b.destinationBlockchain === blockchain);

    if (existingBlockchain) {
      existingBlockchain.numTokensOffered += tokens;
    } else {
      existing.blockchains.push({
        destinationBlockchain: blockchain,
        numTokensOffered: tokens,
      });
    }
    return acc;
  }, [] as {
    investToken: string;
    totalTokens: number;
    blockchains: { destinationBlockchain: string; numTokensOffered: number }[];}[]
  ) : []

  useEffect(() => {
    dispatch(readBonds());
    dispatch(getRetailMktBonds())
  }, [dispatch]);

  return (
    <>
      <div className="container mt-3 ">
        <div className="card mt-3 d-flex justify-content-center align-items-center" style={{ minWidth: "100vh" }}>
          <div className="position-absolute top-0 end-0 m-3">
            <button className="btn btn-primary me-2" onClick={() => navigate("/investor-wallet")}>
              My investor Wallet
            </button>
            <button className="btn btn-outline-primary" onClick={() => navigate("/user-access")}>
              Log out
            </button>
          </div>
          <h1 className="text-primary m-5 align-self-start">List of Oportunities:</h1>
          <div className="container-md d-flex flex-column align-items-center mr-3 ml-3">
            <div className="row">
              {/* {bonds?.map((bond) => (
                <div key={bond._id} className="col-md-6">
                  <BondCard bond={bond} user={user!} />
                </div>
              ))} */}
              {bonds?.map((bond) => {
                const match = groupedMarketData.find((item) => item.investToken === bond._id);

                if (!match) return null; // No hay coincidencia, no renderizar

                return (
                  <div key={bond._id} className="col-md-6">
                    <BondCard bond={bond} user={user!} marketData={match} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Oportunities;
