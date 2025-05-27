import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getTrxSuccess, getTrxError } from "../features/adminSlice";
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

const Admin = () => {
  const dispatch = useAppDispatch();
  const { trxSuccess, trxError } = useAppSelector(state => state.admin);
  const [status, setStatus] = useState<"success" | "error">("success");

  useEffect(() => {
    dispatch(getTrxSuccess());
    dispatch(getTrxError());
  }, [dispatch]);

  const handleFaucet = () => {
    console.log("Faucet");
  }

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Faucet</h5>
              <Form className="d-flex gap-2">
                <Form.Control type="text" placeholder="Wallet Address" />
                <Form.Control type="number" placeholder="Amount" />
                <Button variant="primary" onClick={handleFaucet}>Faucet</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Transactions {status === "success" ? "exitosas" : "fallidas"}</h5>
              <div className="d-flex gap-2">
                <Button 
                  style={{ 
                    backgroundColor: status === "success" ? "#7ba6e9" : "white",
                    color: status === "success" ? "white" : "#7ba6e9",
                    border: "1px solid #7ba6e9",
                    padding: "8px 16px",
                    borderRadius: "4px"
                  }}
                  onClick={() => setStatus("success")}
                >
                  Success
                </Button>
                <Button 
                  style={{ 
                    backgroundColor: status === "error" ? "#7ba6e9" : "white",
                    color: status === "error" ? "white" : "#7ba6e9",
                    border: "1px solid #7ba6e9",
                    padding: "8px 16px",
                    borderRadius: "4px"
                  }}
                  onClick={() => setStatus("error")}
                >
                  Error
                </Button>
              </div>
            </div>

            <Form className="d-flex gap-2">
              <Form.Control type="text" placeholder="Search..." className="w-25" />
              <Button 
                style={{ 
                  backgroundColor: "#7ba6e9",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px"
                }}
              >
                Search
              </Button>
            </Form>
          </div>

          <div className="table-responsive" style={{ margin: "-1px" }}>
            <table border={1} style={{ 
              borderCollapse: "collapse", 
              width: "100%", 
              textAlign: "center", 
              backgroundColor: "#d9e8fc"
            }}>
              <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
                <tr>
                  <th style={{ padding: "12px" }}>User ID</th>
                  <th style={{ padding: "12px" }}>Trx Type</th>
                  <th style={{ padding: "12px" }}>Network</th>
                  <th style={{ padding: "12px" }}>Date</th>
                  <th style={{ padding: "12px" }}>trx id</th>
                </tr>
              </thead>
              <tbody>
                {status === "success" ? trxSuccess.map(trx =>
                  <tr key={trx._id}>
                    <td style={{ padding: "12px" }}>{trx.userId}</td>
                    <td style={{ padding: "12px" }}>{trx.trx_type}</td>
                    <td style={{ padding: "12px" }}>{trx.network}</td>
                    <td style={{ padding: "12px" }}>{new Date(trx.timestamp).toLocaleDateString()}</td>
                    <td style={{ padding: "12px" }}>{trx.trx}</td>
                  </tr>)
                  :
                  trxError.map(trx =>
                    <tr key={trx._id}>
                      <td style={{ padding: "12px" }}>{trx.userId}</td>
                      <td style={{ padding: "12px" }}>{trx.trx_type}</td>
                      <td style={{ padding: "12px" }}>{trx.network}</td>
                      <td style={{ padding: "12px" }}>{new Date(trx.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: "12px" }}>{trx.trx}</td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Admin;