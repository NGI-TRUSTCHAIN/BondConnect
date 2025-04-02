import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import { readUsers } from "../../features/bondSlice";

const HolderList = () => {
  const users = useAppSelector((state) => state.bond.users);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(readUsers());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const filteredUsers = users.filter((user) => user.userId.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="card mt-3">
        <h2 className="text-primary mb-2" style={{ textAlign: "center" }}>
          BOND INVESTOR LIST
        </h2>

        <h3 className="section-title mt-4">Upcoming payments</h3>
        <div className="mb-4">
          {/* <label className="mr-2 font-bold">Buscar por User ID:</label> */}
          <input
            type="text"
            className="form-control bg-form"
            placeholder="Search by User ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="table-hl" border={1}>
          <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
            <tr>
              <th>User ID</th>
              <th>Bond Name</th>
              <th>Token Amount</th>
              <th>Blockchain Network</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr key={user._id}>
                <td>{user.userId}</td>
                <td>{user.investToken}</td>
                <td>{user.purchasedTokens}</td>
                <td>{user.destinationBlockchain}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="container-md row m-3" style={{ display: "flex", gap: "20px" }}>
          <button
            type="button"
            className="btn btn-primary col-sm-2"
            onClick={() => navigate("/manage-bonds")}
            style={{ alignSelf: "start" }}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolderList;
