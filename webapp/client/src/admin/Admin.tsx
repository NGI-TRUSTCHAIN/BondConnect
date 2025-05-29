import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getTrxSuccess, getTrxError } from "../features/adminSlice";
import { Container, Form, Button, Dropdown } from 'react-bootstrap';
import { faucetStable } from "../features/userSlice";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const dispatch = useAppDispatch();
  const { trxSuccess, trxError } = useAppSelector(state => state.admin);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [trxTypeFilter, setTrxTypeFilter] = useState<string>("");
  const [searchUserId, setSearchUserId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    dispatch(getTrxSuccess());
    dispatch(getTrxError());
  }, [dispatch]);

  const handleFaucet = async () => {
    console.log("doFaucet");
    const response = await dispatch(faucetStable({ address: address, amount: amount }));
    if (response.payload) {
      console.log("Faucet exitoso");
    } else {
      console.log("Faucet fallido");
    }
  }

  const getPrefixedTrx = (network: string, trx: string) => {
    switch (network) {
      case 'ALASTRIA':
        return `https://b-network.alastria.izer.tech/tx/${trx}`;
      case 'AMOY':
        return `https://amoy.polygonscan.com/tx/${trx}`;
      default:
        return trx; // Sin prefijo si no coincide
    }
  };

  const filteredTrxSuccess = trxSuccess.filter(trx =>
    trxTypeFilter ? trx.trx_type === trxTypeFilter : true
  ).filter(trx =>
    searchUserId ? trx.userId.includes(searchUserId) : true
  );
  const filteredTrxError = trxError.filter(trx =>
    trxTypeFilter ? trx.trx_type === trxTypeFilter : true
  ).filter(trx =>
    searchUserId ? trx.userId.includes(searchUserId) : true
  );
  const navigate = useNavigate();
  return (
    <Container fluid className="p-4" style={{ maxWidth: '140vh' }}>
      <h1 className="mb-4">Admin Dashboard</h1>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h5 className="mb-3">Faucet</h5>
        <div className="row">
          <div className="col-md-6">
            <Form className="d-flex gap-2 mb-4">
              <Form.Control type="text" placeholder="Wallet Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Form.Control type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <Button variant="primary" onClick={handleFaucet}>Faucet</Button>
            </Form>
          </div>
          <div className="col-md-6 text-end">
            <Button variant="primary" onClick={() => navigate("/")}>
              Log out
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <h5 style={{
            fontSize: '24px',
            color: '#7ba6e9',
            margin: 0,
            marginBottom: '20px'
          }}>
            Transactions {status === "success" ? "exitosas" : "fallidas"}
          </h5>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="row">
              <div className="col-md-6">
                <Form className="d-flex gap-2">
                  <Form.Control 
                    type="text" 
                    placeholder="Search..." 
                    style={{ width: "300px" }}
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                  />
                  {/* <Button variant="primary" onClick={() => setSearchUserId(searchUserId)}>Search</Button> */}
                </Form>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant={status === "success" ? "primary" : "outline-secondary"}
                onClick={() => setStatus("success")}>
                Success
              </Button>
              <Button
                variant={status === "error" ? "primary" : "outline-secondary"}
                onClick={() => setStatus("error")}>
                Error
              </Button>
            </div>
          </div>
        </div>

        <div style={{ 
          overflowX: 'visible',
          overflowY: 'visible', 
          position: 'relative', 
          zIndex: 1, 
          margin: '0 -24px', 
          width: '135vh' 
        }}>
          <div style={{ minWidth: '100%', padding: '0 24px', width: '135vh' }}>
            <table style={{
              borderCollapse: "collapse",
              width: "100%",
              textAlign: "center",
              backgroundColor: "#d9e8fc",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              overflowX: "hidden",
              overflowY: "visible",
              position: "relative",
              tableLayout: "fixed"
            }}>
              <thead style={{ backgroundColor: "#7ba6e9" }}>
                <tr>
                  <th className="admin-table-header" style={{ width: "20%" }}>User ID</th>
                  <th className="admin-table-header" style={{ width: "20%" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', position: 'relative' }}>
                      Trx Type
                      <Dropdown>
                        <Dropdown.Toggle variant="link" id="dropdown-trxtype" style={{ padding: 0, border: 'none', background: 'none' }}></Dropdown.Toggle>
                        <Dropdown.Menu style={{ 
                          maxHeight: '200px', 
                          overflowY: 'scroll', 
                          zIndex: 9999,
                          position: 'fixed',
                          top: 'calc(100% + 1px)',
                          left: '0',
                        }}>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("")} active={trxTypeFilter === ""}>All Types</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("purchaseBond")} active={trxTypeFilter === "purchaseBond"}>Purchase Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("redeemBond")} active={trxTypeFilter === "redeemBond"}>Redeem Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("callContractMethodController")} active={trxTypeFilter === "callContractMethodController"}>Call Contract Method</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("executeContractMethodController")} active={trxTypeFilter === "executeContractMethodController"}>Execute Contract Method</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("mintBond")} active={trxTypeFilter === "mintBond"}>Mint Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("bridge")} active={trxTypeFilter === "bridge"}>Bridge</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("burn")} active={trxTypeFilter === "burn"}>Burn</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("createBond")} active={trxTypeFilter === "createBond"}>Create Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("requestTransfer")} active={trxTypeFilter === "requestTransfer"}>Request Transfer</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("balance")} active={trxTypeFilter === "balance"}>Balance</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("getFaucetBalance")} active={trxTypeFilter === "getFaucetBalance"}>Get Faucet Balance</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("faucet")} active={trxTypeFilter === "faucet"}>Faucet</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("requestStable")} active={trxTypeFilter === "requestStable"}>Request Stable</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("createAccountMultiple")} active={trxTypeFilter === "createAccountMultiple"}>Create Account Multiple</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("createIndividualAccountRetry")} active={trxTypeFilter === "createIndividualAccountRetry"}>Create Individual Account Retry</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </th>
                  <th className="admin-table-header" style={{ width: "10%" }}>Network</th>
                  <th className="admin-table-header" style={{ width: "10%" }}>Date</th>
                  <th className="admin-table-header" style={{ width: "40%" }}>trx id</th>
                </tr>
              </thead>
              <tbody>
                {status === "success" ? filteredTrxSuccess.length > 0 ? filteredTrxSuccess.map(trx =>
                  <tr key={trx._id}>
                    <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trx.userId}</td>
                    <td className="admin-table-cell">{trx.trx_type}</td>
                    <td className="admin-table-cell">{trx.network}</td>
                    <td className="admin-table-cell">{new Date(trx.timestamp).toLocaleDateString()}</td>
                    <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><a href={getPrefixedTrx(trx.network, trx.trx)} target="_blank" rel="noopener noreferrer">{trx.trx}</a></td>
                  </tr>)
                  :
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>No hay registros disponibles.</td>
                  </tr>
                  :
                  filteredTrxError.length > 0 ? filteredTrxError.map(trx =>
                    <tr key={trx._id}>
                      <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trx.userId}</td>
                      <td className="admin-table-cell">{trx.trx_type}</td>
                      <td className="admin-table-cell">{trx.network}</td>
                      <td className="admin-table-cell">{new Date(trx.timestamp).toLocaleDateString()}</td>
                      <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><a href={getPrefixedTrx(trx.network, trx.trx)} target="_blank" rel="noopener noreferrer">{trx.trx}</a></td>
                    </tr>
                  ) :
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>No hay registros disponibles.</td>
                  </tr>
                }
              </tbody>
            </table>
            {/* ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>No hay registros disponibles.</p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Admin;