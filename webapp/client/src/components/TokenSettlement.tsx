import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Bond } from "../Bond";
import { createSettlementReceipt, readBonds } from "../features/bondSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface SettlementReceipt {
  _id: string | undefined,
  settleToken: string,
  settlementType: string,
  amountOf: number | undefined,
  distributionCriteria: string | undefined
}

const TokenSettlement = () => {
  const [settlementReceipt, setSettlementReceipt] = useState<SettlementReceipt>({
    _id: undefined,
    settleToken: '',
    settlementType: '',
    amountOf: undefined,
    distributionCriteria: undefined
  });
  // const [token, setToken] = useState('');
  // const [settlementType, setSettlementType] = useState('');
  // const [distributionCriteria, setDistributionCriteria] = useState('');
  // const [number, setNumber] = useState(0);
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null); // To store the complete bond object

  const dispatch = useAppDispatch();
  const registeredBonds = useAppSelector((state) => state.bond.bonds);
  const error = useAppSelector((state) => state.bond.error);
  const today = new Date();
  const [showPopupEarly, setShowPopupEarly] = useState(false); 
  const [showPopupPartial, setShowPopupPartial] = useState(false); 

  useEffect(() => {
    document.title = 'Token Sale';
    dispatch(readBonds());
    console.log('Dispatched fetchBonds');
  }, [dispatch]);

  useEffect(() => {
      if (settlementReceipt.settleToken) {
        console.log(`Input value changed: ${settlementReceipt.settleToken}`);
        setSelectedBond(registeredBonds?.find((bond) => bond.bondName === settlementReceipt.settleToken) || null)
      }
    }, [settlementReceipt.settleToken, registeredBonds]); 

  // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedId = e.target.value; // Get the selected bond's _id
  //   const bond = registeredBonds!.find((bond) => bond._id === selectedId) || null; // Find the bond object
  //   setSelectedBond(bond); // Save the complete bond object
  //   // setToken(bond!.bondName);
  // };
  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setSettlementReceipt((prevInputs) => ({
        ...prevInputs,
        [name]: value,
      }));
    };
  
  // const handleShowPopupE = () => { // Handle form data submit or show pop-up
  //   setShowPopupEarly(true);
  // };
  // const handleShowPopupP = () => {
  //   setShowPopupPartial(true);
  // };

  // Handle the actual form submission or any action when "Create bond" is clicked
    const handleConfirmSubmit = async () => {
      try {
        console.log('Info:', settlementReceipt);
        toast.info(
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(settlementReceipt, null, 2)}
          </pre>
        );
        toast.success('Success')
        await dispatch(createSettlementReceipt(settlementReceipt))
      }catch (error) {
        toast.error(`Failed to settle the token. Please try again.\n ${error}`);
      } finally{
        handleClosePopup();
        // navigate('/')
      }
       // Close the pop-up after the action is confirmed
    };

  // Handle closing of the pop-up
  const handleClosePopup = () => {
    setShowPopupEarly(false);
    setShowPopupPartial(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log(settlementReceipt , today, selectedBond?.redemptionStartDate,selectedBond?.redemptionFinishDate);

    if (settlementReceipt.settlementType === 'Maturity date') {
      console.log('Does something (Not defined yet)');
    } else if (settlementReceipt.settlementType === 'Early redemption'){
      // selectedBond?.earlyRedemptionClauses === 'no' ? toast.error('You can`t redeem this bond. Does not allow early redemption. Await maturity date') : isWithinRedemptionPeriod ? setShowPopupEarly(true) : toast.error('Not within redemption period')
      if (selectedBond?.earlyRedemptionClauses === 'no') {
        toast.error('You can’t redeem this bond. It does not allow early redemption. Await the maturity date.');
      } else if (today >= new Date(selectedBond!.redemptionStartDate!) && today <= new Date(selectedBond!.redemptionFinishDate!)) {
        setShowPopupEarly(true);
      } else {
        toast.error('Not within the redemption period.');
      }
      console.log('Does something different, but it is not defined yet');
    } else if (settlementReceipt.settlementType === 'Partial redemption') {
      console.log('Yes');
      setShowPopupPartial(true)
    }
  };

  return (
    <div className='container-fluid mt-3 d-flex justify-content-center align-items-center'>
      <div className='card mt-3' style={{ width: '75%' }}>
        <form className='container mt-4' style={{ textAlign: 'left' }} onSubmit={handleSubmit}>
          <h2 className='text-primary mb-4' style={{ textAlign: 'center' }}>TOKEN SETTLEMENT MANAGEMENT</h2>

          {/* Section 1.1: Basic Bond Information */}
          <div className='container-md m-3'>
            <div className='row'>
              <div className='col-sm-12 mb-3'>
                <label htmlFor='settleToken' className='form-label'>Select Token:</label>
                <select id='settleToken' name='settleToken' className='form-control bg-form' 
                  value={settlementReceipt.settleToken} onChange={handleData}>
                  <option value='' disabled>Select token</option>
                  {!error &&
                    registeredBonds?.map((bond) => (
                      <option key={bond._id} value={bond.bondName}>
                        {bond.bondName} 
                      </option>
                    ))}
                </select>
              </div>

              <h6 className='text-primary mb-4 mt-4'>TOKEN SETTLEMENT MANAGEMENT</h6>
              <div className='col-sm-12 mb-3'>
                <label htmlFor='settlementType' className='form-label'>
                  The settlement type determines how and when the bond is settled
                </label>
                <select id='settlementType' name='settlementType'
                  className='form-control bg-form'
                  onChange={handleData}>
                    <option value="Maturity date">Maturity date</option>
                    <option value="Early redemption">Early redemption</option>
                    <option value="Partial redemption">Partial redemption</option>
                </select>
              </div>
              <p className='text-danger'>** Automatic settlement at bond maturity date</p>
            </div>
          </div>
          <div className='container-md row m-3' style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button type='submit' className='btn btn-primary col-sm-4' style={{ alignItems: 'right' }} onClick={handleSubmit}>
              Confirm
            </button>
          </div>
        </form>
        <ToastContainer />

        {showPopupEarly && (
          <div className='popup-overlay'>
            <div className='popup'>
              <h2 className='text-primary mb-3' style={{ textAlign: 'center' }}>TOKEN SETTLEMENT MANAGEMENT</h2>
              <h2 className='text-primary mb-5' style={{ textAlign: 'left' }}>Early redemption</h2>
              <h3 style={{ textAlign: 'left' }}>Tokens redeemed: {selectedBond?.numberTokens}</h3>
              <h3 style={{ textAlign: 'left' }}>Redemption penalty: {selectedBond?.penalty}</h3>
              <h3 style={{ textAlign: 'left' }}>Amount paid after penalty: XXXX€</h3>

              <div className='popup-actions'>
                <button className='btn btn-primary' onClick={handleConfirmSubmit}>
                  Process early redemption
                </button>
                <button className='btn btn-secondary' onClick={handleClosePopup}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showPopupPartial && (
          <div className='popup-overlay'>
            <div className='popup'>
              <h2 className='text-primary mb-3' style={{ textAlign: 'center' }}>TOKEN SETTLEMENT MANAGEMENT</h2>
              <h2 className='text-primary mb-5'>Partial redemption</h2>
              <div className='col-sm-12 mb-3'>
                <label htmlFor='amountOf' className='form-label'>Tokens listed for Sale:</label>
                <input type='number' max={selectedBond?.numberTokens} id='amountOf' name='amountOf'
                  className='form-control bg-form' placeholder={`${selectedBond?.numberTokens} available`}
                  onChange={handleData}/>
              </div>
              <div className='col-sm-12 mb-3'>
                <label htmlFor='distributionCriteria' className='form-label'>
                  Distribution criteria:
                </label>
                <select id='distributionCriteria' name='distributionCriteria' className='form-control bg-form' value={settlementReceipt.distributionCriteria || ''} // Update state on input change
                  onChange={handleData} >
                    <option value='' disabled>Select sale type</option>
                    <option value='FIFO'>FIFO</option>
                    <option value='Proportional'>Proportional</option>
                </select>
              </div>
              <div className='popup-actions'>
                <button className='btn btn-primary' onClick={handleConfirmSubmit}>
                  Process partial redemption
                </button>
                <button className='btn btn-secondary' onClick={handleClosePopup}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Styling for popup */}
        <style>
          {`
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
        }
        .popup {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 50%;
            text-align: left;
        }
        .popup-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        `}
        </style>

      </div>
    </div>
  );
}

export default TokenSettlement