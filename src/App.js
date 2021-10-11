import React, { useState, useEffect } from "react";
import { Button } from "@consta/uikit/Button";
import InputWrapper from "./components/InputWrapper";
import {
  createFriendRequest,
  getUserKeyAndContentKey,
} from "./open-friend-sdk";

import styles from "./app.module.scss";

function App() {
  const [ethAddress, setEthAddress] = useState("");
  const [usersName, setUsersName] = useState("");
  const handleSendFriendRequest = async () => {
    const openFriendKeys = await getUserKeyAndContentKey();
    // sign the friend request and send it
    const friendRequest = await createFriendRequest({
      openFriendKeys,
      toUser: ethAddress,
      usersName,
    });
    console.log("friendRequest", friendRequest);
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
    </div>
  );
}

export default App;
