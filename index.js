const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const HDKey = require('hdkey');
const EC = require('elliptic').ec;
const bs58check = require('bs58check');
const ethers = require('ethers');

// Set this constants according to your needs
const network = 'mainnet'; // or "testnet"
const N_BTC_ADDRESSES = 2;
const N_ETH_ADDRESSES = 2;

const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
//const mnemonic = ''; // Write a mnemonic phrase to recover wallet

console.log('Mnemonic phrase:', mnemonic);
const seed = bip39.mnemonicToSeedSync(mnemonic, '');

// Generate Ethereum addresses
for (let i = 0; i < N_ETH_ADDRESSES; i++) {
    const ethereumRoot = hdkey.fromMasterSeed(seed);
    const ethereumChild = ethereumRoot.derivePath(`m/44'/60'/0'/0/${i}`);
    const ethereumWallet = ethereumChild.getWallet();

    console.log('ETHEREUM ADDRESS')
    console.log(`Ethereum public address: ${ethereumWallet.getAddressString()}`);
    console.log(`Ethereum private key: ${ethereumWallet.getPrivateKeyString()}`);
}

// Generate Bitcoin and DeSo addresses
for (let i = 0; i < N_BTC_ADDRESSES; i++) {
    const nonStandard = false;
    const keychain = HDKey.fromMasterSeed(seed).derive(`m/44'/0'/0'/0/${i}`, nonStandard);

    const seedHex = keychain.privateKey.toString('hex');
    const privateKey = seedHexToPrivateKey(seedHex);
    const btcDepositAddress = keychainToBtcAddress(
        keychain.identifier,
        network
    );
    const publicKey = privateKeyToDeSoPublicKey(privateKey, network);

    console.log(`BTC/DESO ADDRESSES ${i + 1}`);
    console.log(`Bitcoin public address: ${btcDepositAddress}`);
    console.log(`DeSo public address: ${publicKey}`);
    console.log(`Btc/DeSo private key: ${privateKey.getPrivate('hex')}`);
}

// Util functions
function seedHexToPrivateKey(seedHex) {
    const ec = new EC('secp256k1');
    return ec.keyFromPrivate(seedHex);
}

function keychainToBtcAddress(identifier, network) {
    const prefix = getPublicKeyPrefixes(network).bitcoin;
    const prefixAndKey = Uint8Array.from([...prefix, ...identifier]);

    return bs58check.encode(prefixAndKey);
}

function privateKeyToDeSoPublicKey(privateKey, network) {
    const prefix = getPublicKeyPrefixes(network).deso;
    const key = privateKey.getPublic().encode('array', true);
    const prefixAndKey = Uint8Array.from([...prefix, ...key]);

    return bs58check.encode(prefixAndKey);
}

// BTC and DeSo address prefixes
function getPublicKeyPrefixes(network) {
    if (network == 'mainnet') {
        return {
            bitcoin: [0x00],
            deso: [0xcd, 0x14, 0x0]
        };
    } else if (network == 'testnet') {
        return {
            bitcoin: [0x6f],
            deso: [0x11, 0xc2, 0x0]
        };
    }
}