import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect } from "react";
import { getRetailMktBonds, readBonds } from "../../features/bondSlice";
import BondCard from "./BondCard";

const Oportunities = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const bonds = useAppSelector((state) => state.bond.bonds);
  const bonds = useAppSelector((state) => state.bond.retailBonds);
  const user = useAppSelector((state) => state.user.userLoged);


  useEffect(() => {
    // dispatch(readBonds());
    dispatch(getRetailMktBonds())
  }, [dispatch]);

  console.log(user);
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
                if (bond.numberTokens === 0) return null;
                return (
                  <div key={bond._id} className="col-md-6">
                    <BondCard bond={bond} user={user!}  />
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
