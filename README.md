<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Open Friend](#open-friend)
  - [What is Open Friend?](#what-is-open-friend)
  - [Security](#security)
  - [Key Transmission and Friend Requests](#key-transmission-and-friend-requests)
  - [Key Derivation](#key-derivation)
    - [Creating a Friend Request](#creating-a-friend-request)
  - [Sending a friend request to a group](#sending-a-friend-request-to-a-group)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Open Friend

The philosophy of Open Friend is that the most important part of social media is our own personal social graphs. Your "friend list" on Facebook, your "connections" on LinkedIn, your "mutuals" on Twitter. Open Friend is an attempt to make your social graph portable, private, and secure.

## What is Open Friend?

Open Friend is a key exchange protocol, modeled after the idea of a "friend request". A friend request from Alice to Bob consists of Alice's symmetric encryption key, public key, and a signature. The symmetric encryption key is used to encrypt Alice's posts or content on a social network. The public key is used to authenticate Alice's posts, which are signed with the corresponding private key. The signature is used to prevent a malicious user from impersonating Alice.

If Bob chooses to accept Alice's friend request, then Bob stores Alice's keys, and uses them to decrypt Alice's posts and content.

## Security

All encryption and decryption happens client side, ensuring that only authorized users can see posts and content. This also permits using standard web2 infrastructure to host and serve Open Friend applications, which is inexpensive and scales well.

## Key Transmission and Friend Requests

A user may transmit their keys via a "friend request" to another user. The transport method for these keys is flexible. For example, you could simply email them to a user. For our implementation, we ask the user sending the friend request to enter the ETH wallet address of the receiving user. We then use the Lit Protocol to encrypt the friend request on the client side to the receiving user's ETH wallet address, ensuring that only the intented user can decrypt the friend request.

## Key Derivation

All keys are derived deterministically from a signature created by the user's crypto wallet (metamask, etc). This means that a user can always re-derive their Open Friend keys as long as they don't lose their crypto wallet keys.

There are three components sent in a friend request:

- The content key, which is a symmetric encryption key used to encrypt the content of posts by the user.
- The signing key, which is used to sign and authenticate the user's posts.
- The wallet signature, which is a signature of the content key and signing key, signed by the user's ETH wallet. This proves ownership of the ETH wallet by the user who created the friend request.

### Creating a Friend Request

To create a friend request, use the `getUserKeyAndContentKey` function in open-friend-sdk.js to obtain your content key and signing key. Then use the `createFriendRequest` function to create the friend request. You should then encrypt the friend request to the receiving user's ETH wallet address using the Lit Protocol. An example of this complete process can be found in src/App.js in the `handleSendFriendRequest` function.

## Sending a friend request to a group

Groups like DAOs are already represented on chain, so what if you wanted to send a friend request to a group? When creating a friend request, instead of specifying a wallet address of the user who will receive the request (and therefore be able to decrypt your posts), you specify the Lit Access Control Conditions under which the group is able to decrypt your posts. For example, if the access control condition is that the user must be a member of the FWB DAO, then any member of the FWB DAO can decrypt your posts. This is currently not implemented, but will be in the future.
