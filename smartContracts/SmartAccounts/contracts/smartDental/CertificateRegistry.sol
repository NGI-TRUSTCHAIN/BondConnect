// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistry
 * @author fernando lopez
 * @notice Un registro de certificados mejorado que permite la creación dinámica de tipos
 * y la gestión de múltiples certificados pendientes por usuario.
 */
contract CertificateRegistry {

    struct Certificate {
        uint typeId;
        uint256 creationTimestamp;
        address recipient; 
         uint256 signTimestamp;
    }

    struct CertificateType {
        uint typeId;
        string name;
        bool exists;
    }

    // Mapping principal de certificados registrados, indexado por su hash
    mapping(bytes32 => Certificate) public certificates;

    // Mapping para los tipos de certificado. Usamos un contador para asegurar IDs únicos.
    mapping(uint => CertificateType) public certificateTypes;
    uint public nextTypeId; // MEJORA: Contador para nuevos tipos.

    // Mapping de certificados firmados por cada dirección
    mapping(address => bytes32[]) private signedCertificates;


    // mapping(dirección del firmante => array de hashes de certificados pendientes)
    mapping(address => bytes32[]) public pendingCertificatesForUser;

    // mapping(dirección del firmante => mapping(hash del certificado => bool))
    mapping(address => mapping(bytes32 => bool)) private isCertificatePending;

    address public owner;

    // --- Modificadores ---

    modifier isOwner() {
        require(msg.sender == owner, "Auth: Not the owner");
        _;
    }

    // --- Eventos ---

    event CertificateTypeCreated(uint indexed typeId, string name);
    event CertificateIssued(bytes32 indexed certificateHash, uint indexed typeId, address indexed recipient, address issuer);
    event CertificateSigned(bytes32 indexed certificateHash, address indexed signer);
    event CertificatesCleared(uint indexed _timestamp, uint indexed size);

    // --- Constructor ---

    constructor() {
        owner = msg.sender;
        nextTypeId = 1; // Inicializamos el contador
        // Creamos los tipos iniciales de forma modular
        createCertificateType("Login");
        createCertificateType("X-ray");
    }

    // --- Funciones de Gestión (Owner) ---

    /**
     * @notice : Crea un nuevo tipo de certificado. Solo el owner.
     * @param _name El nombre del nuevo tipo de certificado (ej. "Diploma", "Permiso").
     */
    function createCertificateType(string memory _name) public isOwner {
        require(bytes(_name).length > 0, "Input: Name cannot be empty");
        uint currentId = nextTypeId;
        certificateTypes[currentId] = CertificateType({
            typeId: currentId,
            name: _name,
            exists: true
        });
        emit CertificateTypeCreated(currentId, _name);
        nextTypeId++;
    }

    /**
     * @notice Registra y asigna un certificado a un destinatario para que lo firme.
     * @param _certificateHash Hash único del contenido del certificado.
     * @param _recipient La dirección que debe firmar el certificado.
     * @param _typeId El ID del tipo de certificado a registrar.
     */
    function issueCertificate(bytes32 _certificateHash, address _recipient, uint _typeId) external isOwner {
        require(certificates[_certificateHash].creationTimestamp == 0, "Error: Certificate already exists");
        require(certificateTypes[_typeId].exists, "Error: Certificate type does not exist");
        require(_recipient != address(0), "Error: Invalid recipient address");
        

        certificates[_certificateHash] = Certificate({
            typeId: _typeId,
            creationTimestamp: block.timestamp,
            recipient: _recipient,
            signTimestamp: 0

        });

        // Añade el certificado a la lista de pendientes del destinatario.
        pendingCertificatesForUser[_recipient].push(_certificateHash);
        isCertificatePending[_recipient][_certificateHash] = true;

        emit CertificateIssued(_certificateHash, _typeId, _recipient, msg.sender);
    }

    // --- Funciones de Firma (Usuario) ---

    /**
     * @notice El destinatario firma un certificado pendiente. 
     * @dev La firma siempre es del propietario del smart contract.
     * @param _certificateHash El hash del certificado que se está firmando.
     * @param _signature La firma digital del hash del certificado.
     */
    function signCertificate(bytes32 _certificateHash, bytes calldata _signature, address _recipient) external {
        require(isCertificatePending[_recipient][_certificateHash], "Error: Certificate is not pending for you");

         // Prefijo y hash igual que en JS
        string memory prefix = "\x19Alastria Signed Message:\n32";
        bytes32 msgHash = keccak256(abi.encodePacked(prefix, _certificateHash));

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        address signer = ecrecover(msgHash, v, r, s);
        require(signer == owner, "Signing error: No is the owner");

        signedCertificates[_recipient].push(_certificateHash);
        isCertificatePending[_recipient][_certificateHash] = false; // Lo marca como no pendiente

        // MEJORA: Elimina el certificado de la lista de pendientes de forma eficiente.
        _removePendingCertificate(_recipient, _certificateHash);

        emit CertificateSigned(_certificateHash, _recipient);
    }

    /**
     * @dev Usa el método "swap and pop" para una eliminación en O(1) de gas.
     */
    function _removePendingCertificate(address _user, bytes32 _certHash) private {
        bytes32[] storage pendingList = pendingCertificatesForUser[_user];
        for (uint i = 0; i < pendingList.length; i++) {
            if (pendingList[i] == _certHash) {
                // Reemplaza el elemento a eliminar con el último elemento
                pendingList[i] = pendingList[pendingList.length - 1];
                // Elimina el último elemento
                pendingList.pop();
                return;
            }
        }
    }

    // --- Funciones de Consulta (Públicas) ---

    /**
     * @notice Obtiene la lista de hashes de certificados pendientes para un usuario.
     */
    function getPendingCertificatesFor(address _user) external view returns (bytes32[] memory) {
        return pendingCertificatesForUser[_user];
    }

    /**
     * @notice Verifica si un certificado específico ha sido firmado por una dirección.
     */
    function getSigningCertificatesFor(address _signer) external view returns (bytes32[] memory) {
        return signedCertificates[_signer];
    }
    
    /**
     * @notice Obtiene los datos de un certificado registrado.
     */
    function getCertificateInfo(bytes32 _certificateHash) external view returns (uint typeId, uint256 createedTimestamp, address recipient, uint256 signingTimestamp) {
        Certificate memory cert = certificates[_certificateHash];
        require(cert.creationTimestamp != 0, "Error: Certificate not found");
        return (cert.typeId, cert.creationTimestamp, cert.recipient, cert.signTimestamp);
    }


        function recoverSigner(bytes32 messageHash, bytes calldata signature) internal pure returns (address) {
            // Prefix of alastria
            string memory prefix = "\x19Alastria Signed Message:\n32";
            bytes32 alastriaSignedMessageHash = keccak256(abi.encodePacked(prefix, messageHash));
            (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
            return ecrecover(alastriaSignedMessageHash, v, r, s);
        }


     function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "invalid signature length");
    assembly {
        r := mload(add(sig, 32))
        s := mload(add(sig, 64))
        v := byte(0, mload(add(sig, 96)))
    }
}


    function clearSignedCertificates(address recipient) public isOwner {
    uint length = signedCertificates[recipient].length;
    delete signedCertificates[recipient];
    emit CertificatesCleared(block.timestamp, length);
    }

}