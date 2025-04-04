import { useEffect } from "react";
import {  useAppDispatch, useAppSelector } from "../app/hooks";
import BondCard from "./investor/BondCard";
import { readBonds } from "../features/bondSlice";
import { useNavigate } from "react-router-dom";

const ControlPanel = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate()
  const bonds = useAppSelector((state) => state.bond.bonds);
  const user = useAppSelector((state) => state.user.userLoged);
  

  useEffect(() => {
    document.title = 'Control Panel';
    dispatch(readBonds());
    console.log('Dispatched fetchBonds');
  }, [dispatch]);

  if (!bonds || bonds.length === 0) {
    return <p>No bonds available.</p>; // Handle case when no bonds are found
  }

  return (
    // <div className="container mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3" style={{ minWidth: "700px"}}>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {bonds &&
            bonds!.map((bond) => (
              <li key={bond._id} onClick={() => navigate(`/bond/${bond._id}`, { state: { bond } })}><BondCard bond={bond} user={user!}/></li>
            ))}
        </ul>
        <button type="button" className="btn btn-primary col-sm-2"
          onClick={() => navigate("/")} style={{ backgroundColor: "aliceblue", color: "#0d6efd" }}>
          Return
        </button>
      </div>
    // </div>
  )
}

export default ControlPanel