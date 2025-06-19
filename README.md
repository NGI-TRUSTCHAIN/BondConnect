# BondConnect

### Architecture

![BondConnect Architecture](arquiBonds/Slide1.jpg "BondConnect Architecture")

The above image offers a high-level overview of the BondConnect architecture, showcasing the scope of BondConnect and emphasizing the components and APIs mentioned below.

In general, the BondConnect project provides three main components:

- **WebApp**: User interface for platform management and user experience.
- **API REST (Node.js Servers)**: API for user management, payments, and communication with the blockchain, protected by API Key.
- **Smart Contracts on Blockchain**: Set of smart contracts deployed for the issuance, management, and operation of bonds and smart accounts.

Each of these components interacts to provide a secure, efficient, and transparent platform for the issuance, management, and marketing of bonds on blockchain technology.



## **Project Objective**

The objective of the BondConnect project is to create a secure and efficient platform for issuing, managing, and trading bonds. It aims to bridge the gap between traditional finance and blockchain technology, providing a seamless experience for users. By leveraging cutting-edge technology, BondConnect seeks to increase transparency, reduce costs, and enhance the overall bond market ecosystem.

## Project Motivation
The BondConnect project is motivated by the need to create a secure, efficient, and transparent platform for issuing, managing, and trading bonds. By leveraging blockchain technology, we aim to bridge the gap between traditional finance and the digital world, providing a seamless experience for users and increasing the overall efficiency of the bond market ecosystem.



## Essential Functionalities
BondConnect has several defined functionalities that enhance its capabilities. These functionalities are listed below:

- **F1**: Integration of multiple blockchain networks for bond trading.
- **F2**: User-friendly interface for managing bond issuance and trading.
- **F3**: Secure transaction processing with built-in cryptographic features.
- **F4**: Support for various bond types and structures.
- **F5**: Comprehensive API documentation for developers to facilitate integration.
- **F6**: Real-time monitoring of bond transactions and market status.



## Expected Benefits of BondConnect
BondConnect is designed to bring numerous benefits to the bond market ecosystem. Some of the expected benefits include:

- **E1**: Increased transparency in bond transactions, enabling stakeholders to track and verify transactions in real-time.
- **E2**: Reduced costs in bond issuance and trading, achieved through the automation of processes and elimination of intermediaries.
- **E3**: Enhanced security with built-in cryptographic features, protecting transactions and data from unauthorized access.
- **E4**: Improved market efficiency with real-time monitoring, enabling stakeholders to make informed decisions and respond to market changes.
- **E5**: Facilitated integration with comprehensive API documentation, allowing developers to easily integrate BondConnect with existing systems.


## Quick Setup Guide

### Steps to Run the Project


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

