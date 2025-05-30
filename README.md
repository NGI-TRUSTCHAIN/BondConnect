# BondConnect – Quick Setup Guide

## Steps to Run the Project

1. **Clone the repository**:
```bash
git clone https://github.com/NGI-TRUSTCHAIN/BondConnect.git
cd BondConnect
```

2. **Create a `.env` file** in the root with the following:
```
MONGO_URL=mongodb+srv://xxx:xxxxx@cluster0.xxxx.mongodb.net/BondConnect?retryWrites=true&w=majority&appName=Cluster0
PORT=xxxx
```

3. **Install dependencies**:
```bash
cd webapp
npm install
cd ../tokenization-API/ERC20
npm install
cd ../SA
npm install
```

4. **Start all services**:
```bash
# Start webapp
cd webapp
npm start

# In a new terminal, start ERC20
cd tokenization-API/ERC20
npm start

# In another terminal, start SA
cd tokenization-API/SA
npm start
```

## Note

To use your own MongoDB, register at [https://cloud.mongodb.com/](https://cloud.mongodb.com/) and replace the `MONGO_URL` in your `.env`.
