import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { readBonds } from "../../features/bondSlice";
import { Bond } from "../../Bond";
import { PaymentRecord } from "./EnterpriseWallet";
import { useNavigate } from "react-router-dom";

const PaymentManagement = () => {
  const [record, setRecord] = useState<PaymentRecord[]>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const registeredBonds = useAppSelector((state) => state.bond.bonds);
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);

  const handleBond = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBond(registeredBonds?.find((bond) => bond.bondName === e.target.value) || null);
  };

  useEffect(() => {
    document.title = "Blockchain Transfer";
    dispatch(readBonds());
  }, [dispatch]);

  useEffect(() => {
    const records: PaymentRecord[] = [];

    if (selectedBond) {
      let currentDate = new Date(selectedBond!.bondStartDate!);
      const closingDate = new Date(selectedBond!.bondMaturityDate!);

      // Incrementos en función de la frecuencia
      const frequencyIncrement: Record<string, number> = {
        Monthly: 1,
        Quarterly: 3,
        "Semi-annualy": 6,
        Annualy: 12,
      };

      function addMonthsToFirstDay(date: Date, months: number): Date {
        const newDate = new Date(date);
        // newDate.setDate(1); // Ajustar siempre al primer día del mes
        newDate.setMonth(newDate.getMonth() + months);
        // newDate.setDate(newDate.getDate() + (32*months))
        newDate.setDate(1); // Ajustar siempre al primer día del mes
        return newDate;
      }

      // currentDate.setMonth(
      //     currentDate.getMonth() + frequencyIncrement[bond.paymentFreq]
      // );
      currentDate = addMonthsToFirstDay(currentDate, frequencyIncrement[selectedBond!.paymentFreq]);
      while (currentDate <= closingDate) {
        records.push({
          bondName: selectedBond!.bondName,
          paymentDate: currentDate.toISOString().split("T")[0], // Fecha en formato "YYYY-MM-DD"
          amount: 100,
        });

        // Incrementar la fecha según la frecuencia
        // currentDate.setMonth(
        //     currentDate.getMonth() + frequencyIncrement[bond.paymentFreq]
        // );
        currentDate = addMonthsToFirstDay(currentDate, frequencyIncrement[selectedBond!.paymentFreq]);
      }
      records.push({
        bondName: selectedBond!.bondName,
        paymentDate: new Date(selectedBond!.bondMaturityDate!).toISOString().split("T")[0], // Fecha en formato "YYYY-MM-DD"
        amount: 100,
      });

      console.log(records);
      setRecord(records);
    } else {
      console.log("No record");
    }
  }, [selectedBond]);

  return (
    <div className="card mt-4">
      <div className="position-absolute top-0 end-0 m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button
          type="button"
          className="btn btn-primary col-sm-2"
          onClick={() => navigate("/issuer-dash")}
          style={{ backgroundColor: "aliceblue", color: "#0d6efd", width: "90px" }}>
          Cancel
        </button>
      </div>
      <h2 className="mb-3">PAYMENT MANAGEMENT</h2>

      <h2 className="section-title mt-4" style={{ alignSelf: "start" }}>
        Overview of Balance
      </h2>
      <p
        data-bs-toggle="collapse"
        data-bs-target="#balance-collapse"
        role="button"
        aria-expanded="false"
        aria-controls="balance-collapse">
        <strong>Total Available Balance:</strong> “50.000€”
      </p>
      <div className="collapse" id="balance-collapse">
        <ul>
          <li>Alastria: “20.000€”</li>
          <li>Ethereum: “20.000€”</li>
          <li>Polygon: “10.000€”</li>
        </ul>
      </div>

      <h2 className="section-title mt-4" style={{ alignSelf: "start" }}>
        Token Selection:
      </h2>
      <div className="wallet-box">
        <select
          id="bond"
          name="bond"
          className="form-control bg-form"
          value={selectedBond?.bondName}
          onChange={handleBond}>
          <option value="">Select bond</option>
          {registeredBonds?.map((bond) => (
            <option value={bond.bondName} key={bond._id}>
              {bond.bondName}
            </option>
          ))}
        </select>
      </div>

      <h4 className="pending-payments mt-4" style={{ textAlign: "left" }}>
        Pending Payments:
      </h4>
      <p className="text-danger">**Only if there are pending payments</p>
      <p>
        <span
          data-bs-toggle="collapse"
          data-bs-target="#pending-payments-collapse"
          role="button"
          aria-expanded="false"
          aria-controls="pending-payments-collapse">
          <strong style={{ marginRight: "15px" }}>
            {!record || record.length === 0 ? "" : record[0].paymentDate}:
          </strong>
          20.000€
        </span>
        <button className="btn-pay-now" style={{ marginLeft: "30px" }}>
          Pay Now
        </button>
      </p>
      {/* <li><input type="checkbox"/> Alastria: “10.000€”</li>
                    <li><input type="checkbox"/> Ethereum: “5.000€”</li>
                    <li><input type="checkbox"/> Polygon: “5.000€”</li> */}
      <div className="collapse" id="pending-payments-collapse">
        <ul style={{ listStyleType: "none" }}>
          {selectedBond?.tokenState.map((block) => (
            <li key={block.blockchain}>
              <input type="checkbox" />
              <strong>{block.blockchain}: </strong> {block.amount}€
            </li>
          ))}
        </ul>
      </div>

      <h2 className="section-title mt-4">Next Payments:</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {record.map((payment) => (
            <tr key={payment.paymentDate}>
              <td>{payment.paymentDate}</td>
              <td>20.000€</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-back mt-4" onClick={() => navigate(-1)}>
        BACK
      </button>
    </div>
  );
};

export default PaymentManagement;
