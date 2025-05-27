import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getTrxSuccess, getTrxError } from "../features/adminSlice";

const Admin = () => {

  const dispatch = useAppDispatch();
  const { trxSuccess, trxError } = useAppSelector(state => state.admin);

  useEffect(() => {
    dispatch(getTrxSuccess());
    dispatch(getTrxError());
  }, [dispatch]);

  return (<div>
    <h1>Yo soy ADMIN</h1>
    <div>
      <h2>Transacciones exitosas</h2>
      <ul>
        {trxSuccess.map(trx => <li key={trx.id}>{trx.id}</li>)}
      </ul>
    </div>
    <div>
      <h2>Transacciones fallidas</h2>
      <ul>
        {trxError.map(trx => <li key={trx.id}>{trx.id}</li>)}
      </ul>
    </div>
    
    </div>);
};


export default Admin;