# BondConnect – Quick Setup Guide

## Steps to Run the Project

1. **Clone the repository**:
```bash
git clone https://github.com/NGI-TRUSTCHAIN/BondConnect.git
cd BondConnect
```
#### Option 1 - Run in local in the host machine

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

##### Note

To use your own MongoDB, register at [https://cloud.mongodb.com/](https://cloud.mongodb.com/) and replace the `MONGO_URL` in your `.env`.

#### Option 2 - Run project in Docker Containers

To initiate the BondConnect project and its associated MongoDB database as outlined in the docker-compose file, execute the following command within the project directory using a command console:

```
docker-compose up --build -d 
# The --build option is used to construct the Docker images for the BondConnect web application, SA, and ERC20.
# The -d option enables detached execution, ensuring the command console remains available for further use.
```

