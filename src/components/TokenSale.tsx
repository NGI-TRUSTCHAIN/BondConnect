import React, { useEffect, useState } from 'react';
import { createSaleReceipt, readBonds } from '../features/bondSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Bond } from '../Bond';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export interface SaleReceipt {
  _id: string | undefined,
  selledToken: string,
  selledAmount: number | undefined,
  pricePerToken: number | undefined,
  saleType: string
}

const TokenSale = () => {
  const [saleReceipt, setSaleReceipt] = useState<SaleReceipt>({
    _id: undefined,
    selledToken: '',
    selledAmount: undefined,
    pricePerToken: undefined,
    saleType: ''
  });
  // const [token, setToken] = useState('');
  // const [number, setNumber] = useState(0);
  // const [price, setPrice] = useState(0);
  // const [saleType, setSaleType] = useState('');
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null); // To store the complete bond object

  const dispatch = useAppDispatch();
  const registeredBonds = useAppSelector((state) => state.bond.bonds);
  const error = useAppSelector((state) => state.bond.error);
  const [showPopup, setShowPopup] = useState(false); // To toggle the pop-up visibility

  useEffect(() => {
    document.title = 'Token Sale';
    dispatch(readBonds());
    console.log('Dispatched fetchBonds');
  }, [dispatch]);

  useEffect(() => {
    if (saleReceipt.selledToken) {
      console.log(`Input value changed: ${saleReceipt.selledToken}`);
      setSelectedBond(registeredBonds?.find((bond) => bond.bondName === saleReceipt.selledToken) || null)
    }
  }, [saleReceipt.selledToken, registeredBonds]); 

  // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedId = e.target.value; // Get the selected bond's _id
  //   const bond = registeredBonds!.find((bond) => bond._id === selectedId) || null; // Find the bond object
  //   setSelectedBond(bond); // Save the complete bond object
  //   setToken(bond!.bondName);
  // };

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSaleReceipt((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    // console.log(token, number, price, saleType);
    // navigate("/confirm", { state: { formData } });
  };

  // Handle form data submit or show pop-up
  const handleShowPopup = () => {
    setShowPopup(true);
  };

  // Handle closing of the pop-up
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Handle the actual form submission or any action when "Create bond" is clicked
  const handleConfirmSubmit = async () => {
    // console.log('Info:', { token, number, price, saleType });
    try {
      console.log('SaleReceipt:', saleReceipt);
      const amount =  saleReceipt.selledAmount! * saleReceipt.pricePerToken!
      toast.success(`You have sold ${saleReceipt.selledAmount} tokens from the bond ${saleReceipt.selledToken} for an amount of ${amount}€`);
      await dispatch(createSaleReceipt(saleReceipt))
    } catch (error) {
      toast.error(`Failed sale the token. Please try again.\n ${error}`);
    } finally{
      setShowPopup(false);
      // navigate('/')
    }
  };

  return (
    <div className='container-fluid mt-3 d-flex justify-content-center align-items-center'>
      <div className='card mt-3' style={{ width: '75%' }}>
        <form className='container mt-4' style={{ textAlign: 'left' }}onSubmit={handleSubmit}>
          <h2 className='text-primary mb-4' style={{ textAlign: 'center' }}>
            TOKEN SALE MANAGEMENT
          </h2>

          {/* Section 1.1: Basic Bond Information */}
          <div className='container-md m-3'>
            <div className='row'>
              {/* <BondCard  bond={registeredBonds?[0]} /> */}
              <div className='col-sm-6 mb-3'>
                <label htmlFor='selledToken' className='form-label'>
                  Token to Sale:
                </label>
                <select id='selledToken' name='selledToken' className='form-control bg-form' 
                  value={saleReceipt.selledToken} onChange={handleData}>
                  <option value='' disabled>Select token</option>
                  {!error &&
                    registeredBonds?.map((bond) => (
                      <option key={bond._id} value={bond.bondName}>
                        {bond.bondName} {/* Number: {bond.numberTokens} Blockchain: {bond.blockchainNetwork} */}
                        {/* <BondCard key={bond._id} bond={bond} /> */}
                      </option>
                    ))}
                </select>
              </div>

              <div className='col-sm-6 mb-3'>
                <label htmlFor='selledAmount' className='form-label'>
                  Tokens listed for Sale:
                </label>
                <input
                  type='number'
                  max={registeredBonds?.find((bond) => bond.bondName === saleReceipt.selledToken)?.numberTokens || 0}
                  id='selledAmount'
                  name='selledAmount'
                  className='form-control bg-form'
                  placeholder={`${selectedBond?.numberTokens || 0} available`}
                  onChange={handleData} // Update state on input change
                />
              </div>
              <div className='col-sm-6 mb-3'>
                <label htmlFor='pricePerToken' className='form-label'>
                  Sale Price:
                </label>
                <input
                  type='number'
                  id='pricePerToken'
                  name='pricePerToken'
                  className='form-control bg-form'
                  // placeholder={`Nominal value: ${(selectedBond!.goalAmount! / selectedBond!.numberTokens!).toFixed(2)}`}
                  // placeholder={selectedBond ? `Nominal value: ${(selectedBond!.goalAmount! / selectedBond!.numberTokens!).toFixed(2)}` : "Nominal value: N/A"}
                  placeholder={ selectedBond ? `Nominal value: ${(selectedBond!.goalAmount! /selectedBond!.numberTokens!).toFixed(2)}` : "Nominal value: N/A"}
                  onChange={handleData} // Update state on input change
                />
              </div>
              <div className='col-sm-6 mb-3'>
                <label htmlFor='saleType' className='form-label'>
                  Sale Type:
                </label>
                <select id='saleType' name='saleType' className='form-control bg-form' value={saleReceipt.saleType} // Update state on input change
                  onChange={handleData} >
                    <option value='' disabled>Select sale type</option>
                    <option value='Fixed price'>Fixed price</option>
                    <option value='Auction'>Auction</option>
                </select>
              </div>
              <p className='text-danger'>** Ensure that the wallet address is compatible with the destination blockchain network</p>
            </div>
          </div>
          <div className='container-md row m-3' style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button type='submit' className='btn btn-primary col-sm-4' style={{ alignItems: 'right' }} onClick={handleShowPopup}>
              Confirm
            </button>
          </div>
        </form>
        <ToastContainer />
        {showPopup && (
          <div className='popup-overlay'>
            <div className='popup'>
              <h2 className='text-primary mb-5' style={{ textAlign: 'center' }}>
                TOKEN SALE MANAGEMENT
              </h2>
              <h3 style={{ textAlign: 'left' }}>Token: {saleReceipt.selledToken}</h3>
              <h3 style={{ textAlign: 'left' }}>Number: {saleReceipt.selledAmount}</h3>
              <h3 style={{ textAlign: 'left' }}>Token Price: {saleReceipt.pricePerToken}</h3>
              <h3 style={{ textAlign: 'left' }}>Sale Type: {saleReceipt.saleType}</h3>

              <div className='text-danger' style={{ textAlign: 'left' }}>
                <h3>
                  <strong>Warning Message:</strong>
                </h3>
                <p className='text-danger'>** Please ensure the wallet address is correct. Blockchain transfers are irreversible.</p>
              </div>
              <div className='popup-actions'>
                <button className='btn btn-primary' onClick={handleConfirmSubmit}>
                  List tokens
                </button>
                <button className='btn btn-secondary' onClick={handleClosePopup}>
                  Edit
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
            max-width: 600px;
            text-align: right;
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
};

export default TokenSale;
