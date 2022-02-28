import LitJsSdk from "lit-js-sdk";
import { verifyMessage } from "@ethersproject/wallet";
import nacl from "tweetnacl";
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";

export const createFriendRequest = async ({
  openFriendKeys,
  toUser,
  usersName,
}) => {
  const serializedOpenFriendKeys = JSON.parse(
    exportOpenFriendKeys(openFriendKeys)
  );
  const request = {
    toUser,
    fromUser: {
      ...openFriendKeys.walletSig,
      name: usersName,
    },
    publicKey: serializedOpenFriendKeys.signingKey.publicKey,
    contentKey: serializedOpenFriendKeys.contentKey,
  };
  //sign request
  const signature = uint8arrayToString(
    nacl.sign(
      uint8arrayFromString(JSON.stringify(request), "utf8"),
      openFriendKeys.signingKey.secretKey
    ),
    "base64"
  );
  return {
    request,
    signature,
  };
};

export const getUserKeyAndContentKey = async () => {
  const { web3, account } = await LitJsSdk.connectWeb3();

  let openFriendKeys = localStorage.getItem("open-friend-keys");
  console.log("got openFriendKeys from localStorage", openFriendKeys);
  if (openFriendKeys) {
    openFriendKeys = importOpenFriendKeys(openFriendKeys);
    // make sure the account selected in metamask is the same as the account in the signature
    if (account !== openFriendKeys.walletSig.address) {
      openFriendKeys = await deriveKeys();
    }
  } else {
    openFriendKeys = await deriveKeys();
  }

  localStorage.setItem(
    "open-friend-keys",
    exportOpenFriendKeys(openFriendKeys)
  );

  return openFriendKeys;
};

const deriveKeys = async () => {
  // user signing key
  // console.log("sig", authSig.sig);
  const body = "I am creating an encryption key for OpenFriend";
  const rootSignature = await signMessage({ body });
  const arrayBufSig = uint8arrayFromString(
    rootSignature.signature.slice(2),
    "base16"
  ).buffer;
  const hash = new Uint8Array(
    await crypto.subtle.digest("SHA-256", arrayBufSig)
  );
  // console.log("hash", hash);
  const signingKey = nacl.sign.keyPair.fromSeed(hash);
  // console.log("signingKey", signingKey);

  // symmetric content key
  const contentKey = nacl.box.keyPair.fromSecretKey(hash);
  // console.log("symmKey", symmKey);

  // sign the signing public key with the eth wallet private key
  const signedSigningKeyBody = `My public signing key is ${uint8arrayToString(
    signingKey.publicKey,
    "base16"
  )}`;
  const signedSigningKey = await signMessage({
    body: signedSigningKeyBody,
  });

  const walletSig = {
    sig: signedSigningKey.signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: signedSigningKeyBody,
    address: signedSigningKey.address,
  };

  return {
    signingKey,
    contentKey,
    walletSig,
  };
};

const exportOpenFriendKeys = ({ signingKey, contentKey, walletSig }) => {
  return JSON.stringify({
    signingKey: {
      publicKey: uint8arrayToString(signingKey.publicKey, "base64"),
      secretKey: uint8arrayToString(signingKey.secretKey, "base64"),
    },
    contentKey: {
      publicKey: uint8arrayToString(contentKey.publicKey, "base64"),
      secretKey: uint8arrayToString(contentKey.secretKey, "base64"),
    },
    walletSig,
  });
};

const importOpenFriendKeys = (body) => {
  const parsed = JSON.parse(body);
  // convert keys back from base64
  const signingKey = {
    publicKey: uint8arrayFromString(parsed.signingKey.publicKey, "base64"),
    secretKey: uint8arrayFromString(parsed.signingKey.secretKey, "base64"),
  };
  const contentKey = {
    publicKey: uint8arrayFromString(parsed.contentKey.publicKey, "base64"),
    secretKey: uint8arrayFromString(parsed.contentKey.secretKey, "base64"),
  };
  return {
    signingKey,
    contentKey,
    walletSig: parsed.walletSig,
  };
};

const signMessage = async ({ body }) => {
  const { web3, account } = await LitJsSdk.connectWeb3();

  console.log("signing with ", account);
  console.log("meow");
  const signature = await LitJsSdk.signMessageAsync(
    web3.getSigner(),
    account,
    body
  );
  // const signature = await web3.getSigner().signMessage(body);
  //.request({ method: 'personal_sign', params: [account, body] })
  const address = verifyMessage(body, signature).toLowerCase();

  console.log("Signature: ", signature);
  console.log("recovered address: ", address);

  if (address !== account) {
    const msg = `ruh roh, the user signed with a different address (${address}) then they\'re using with web3 (${account}).  this will lead to confusion.`;
    console.error(msg);
    alert(
      "something seems to be wrong with your wallets message signing.  maybe restart your browser or your wallet.  your recovered sig address does not match your web3 account address"
    );
    throw new Error(msg);
  }

  return { signature, address };
};
