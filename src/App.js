import React, { useState, useEffect } from "react";
import { Button } from "@consta/uikit/Button";
import InputWrapper from "./components/InputWrapper";
import { SnackBar } from "@consta/uikit/SnackBar";
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import LitJsSdk from "lit-js-sdk";
import {
  createFriendRequest,
  getUserKeyAndContentKey,
} from "./open-friend-sdk";
import api from "./api";

import styles from "./app.module.scss";

function App() {
  const [ethAddress, setEthAddress] = useState("");
  const [usersName, setUsersName] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const handleSendFriendRequest = async () => {
    const openFriendKeys = await getUserKeyAndContentKey();
    const authSig = openFriendKeys.walletSig;
    // sign the friend request and send it
    const friendRequest = await createFriendRequest({
      openFriendKeys,
      toUser: ethAddress,
      usersName,
    });
    console.log("friendRequest", friendRequest);

    const chain = "ethereum";

    // encrypt with the receiver key via lit
    const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(
      JSON.stringify(friendRequest)
    );

    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain,
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: ethAddress,
        },
      },
    ];

    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });

    console.log("encryptedZip", encryptedZip);

    const encryptedZipString = uint8arrayToString(
      new Uint8Array(await encryptedZip.arrayBuffer()),
      "base64"
    );

    const resp = await api.createFriendRequest({
      fromUser: authSig.address,
      toUser: ethAddress,
      fromUserName: usersName,
      encryptedFriendRequestZip: encryptedZipString,
      encryptedSymmetricKey: uint8arrayToString(
        encryptedSymmetricKey,
        "base64"
      ),
      accessControlConditions,
      authSig,
    });
    console.log(resp);
  };
  const handleConnectWallet = async () => {
    const { signingKey, contentKey, walletSig } =
      await getUserKeyAndContentKey();
    console.log("signingKey", signingKey);
    console.log("contentKey", contentKey);
    console.log("walletSig", walletSig);
  };
  return (
    <div className={styles.app}>
      <div style={{ height: 24 }} />
      <Button label="Connect Wallet" onClick={handleConnectWallet} />
      <div style={{ height: 24 }} />
      <InputWrapper
        label="Your Name"
        value={usersName}
        handleChange={(e) => setUsersName(e)}
      />
      <div style={{ height: 24 }} />
      <InputWrapper
        label="ETH Address"
        value={ethAddress}
        handleChange={(e) => setEthAddress(e)}
      />
      <div style={{ height: 16 }} />
      <Button label="Send friend request" onClick={handleSendFriendRequest} />

      {snackbarMessage ? (
        <SnackBar autoClose items={[{ message: snackbarMessage }]} />
      ) : null}
    </div>
  );
}

export default App;
