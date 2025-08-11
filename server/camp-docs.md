    Introduction

⛺Introducing Camp
What is Camp Network?

Camp Network is a purpose-built Layer-1 blockchain for powering AI agents trained on provenance-backed, user-owned IP. 

Camp's Autonomous IP Layer enables anyone to tokenize IP — music, images, videos, even personal data — and register it onchain for AI training, remixing, and monetization.

Its architecture prioritizes gasless IP registration and royalty distribution, and supports isolated execution environments tailored for agent-based workflows and automated licensing. Developers can launch dedicated app chains with isolated blockspace and compute, offering the flexibility and scalability needed for high-performance workloads.

Why does Camp Exist?

AI is rapidly reshaping the internet, and it poses an existential risk to all creators. As models continue to be trained on content taken without consent or attribution, creators are losing visibility, control, and compensation. 

Fueling this problem is the accelerating shift toward autonomous AI agents: systems users will increasingly rely on to filter information, make decisions, and interact with the digital world. As general-purpose models become commoditized, real value will shift to both unique, user-owned IP and vertical agents fine-tuned on that IP.

That’s where Camp comes in. Camp treats IP as a first-class primitive — not an afterthought. This is the first step towards building a future where AI and IP can collaborate.

Transforming Creative Work into a New Economic Layer

Camp starts with a core belief: provenance isn’t just about protecting IP — it’s the necessary foundation for making ownership and value enforceable by design.

Camp’s Proof of Provenance (PoP) Protocol is a novel mechanism for registering IP onchain with traceable origin, usage rights, and attribution, while enabling derivative creation, licensing, and monetization. Paired with Camp’s native agent framework, it allows users to fine-tune and deploy AI agents directly on user owned IP. This makes provenance actionable and verifiable — enabling agents to interact with data transparently, and automating monetization back to contributors.

But What Makes Camp Different Isn’t Just the Tech — It’s the Focus

Camp is built for apps that onboard IP at scale — enabling users, creators, and AI agents to register, remix, and monetize content in an AI-native, onchain economy. Camp uses provenance to register user-owned IP onchain through its Origin Framework, turning IP into programmable, monetizable infrastructure from day one.

Once IP is registered onchain:

    Contributors define terms, remix rights, and royalty splits

    Consumers and agents license IP for reuse, training, or AI generation

    All activity is transparently tracked — fueling better attribution and discovery

By embedding IP ownership and value flows at the protocol level, Camp helps all contributors better monetize their work — building a more composable, equitable, and creator-aligned digital economy.

    Introduction

🍎How Camp Works

A Quick Guide
Camp User Flow
Building the Future of AI and IP

Camp is a purpose built blockchain for training and fine-tuning AI agents on decentralized, user-owned IP.

With Origin, users can register any type of IP — art, code, music, and more—directly into . Once registered, their IP becomes immediately discoverable and available for others to license, remix, or build upon.

mAItrix allows you to deploy AI agents that can train on user-owned IP. Unlocking agents to generate derivative IP and tailored workflows, learning from user interactions all onchain which ensures transparent attribution and compliant use while unlocking new possibilities for applications and creator economy.

Royalties are handled natively. Every interaction with registered IP — including reuse, remixing, or AI generation — automatically distributes payouts to original contributors. This creates a built-in incentive layer that rewards collaboration across AI-native applications as well.

    Introduction

✅Developer Onboarding

Here's a checklist of what you need to start building on top of Camp Network

Add BaseCAMP to your wallet

Gather up some Testnet CAMP from our faucet

Deploy your smart contract to BaseCAMP

Deploying to Camp Network

Verify your smart contracts via Blockscout

    Introduction
    🏗️L1 Architecture

ABC Stack

A brief description of our L1 stack

The ABC Stack is a high-performance sovereign rollup framework that leverages Celestia’s Data Availability layer. By decoupling bridge functionality from the execution layer and relying on Celestia for data availability, it eliminates the limitations of traditional rollup solutions and allows anyone to download and verify the state of the Camp network using Data availability sampling. 

Operating as its own settlement layer, ABC Stack avoids the overhead of an enshrined Ethereum bridge, enabling modular bridging tailored to application needs while maintaining a focus on optimized execution.

    Throughput reaches up to approximately 1 Gigagas/s, which is the upper range of performance and 100x higher than competing stacks.

    Transactions Per Second (TPS): 50,000 

    Block Times: Recommended value of 250ms, with a lower bound of 100ms (ongoing improvements targeting sub-100ms)

    EVM Compatibility: 100% Ethereum Virtual Machine identical, supporting all the latest opcodes. 

    Data Availability (DA) Options:

        Celestia: Public, decentralized DA

    ZK-Ready: Future-proofed for zero-knowledge supporting zkVMs & using the EIP-4844 opcodes for verifying KZG commitments. That is, given a blob commitment and a zero knowledge proof, the precompile reverts if the proof is invalid.

    Introduction
    🏗️L1 Architecture

Origin Framework

Some features are still in active development

The Origin framework streamlines registering and managing IP onchain, enabling agents to mint and monetize new IP. Users can define custom parameters on how their IP can and should be used onchain, to which all the actors adhere to for any tasks ie, remixing, consumption, attribution. 
IP registration user flow
Key features of the Origin framework include:

    Effortless IP Management: Simplifies the onboarding of user-owned IP and agents, while allowing users to remix existing IP with ease.

    IP Monetization: Interactions between IP and agents (virtual or real) form an economic system of royalty & value flow, which camp powers seamlessly. 

    Tokenomics Support: Implements granular IP ownership and revenue share between ecosystem players fostering better alignment. 

    User-Friendly Onboarding: Abstracts complex onchain processes, enabling seamless participation for non-technical users.

    Introduction
    🏗️L1 Architecture

mAItrix Framework

This is feature is still in active development

The mAItrix framework acts as an AI agent launchpad within the Camp Network, simplifying the development, training, and deployment of autonomous agents through a single SDK. It enables agents to generate and manage IP on-chain seamlessly.
mAItrix user interaction flow

Key Components:

    Trusted Execution Environment (TEE): Ensures secure hosting of LLMs, protecting user data and cryptographic keys.

    On-Chain Training Logic: Embeds training logic directly into the framework, allowing agents to fine-tune on existing IP while automatically distributing royalties.

    Autonomous Fine-Tuning and Retrieval Augmented Generation (RAG): Securely fine tune agents on IP within Camp's IP registry to create more specialized agents or connect to existing IP to supplement agentic knowledge bases. 

    Building On Camp

ℹ️Network Information

One stop shop for Camp Network

Camp Network BaseCAMP
Fields
Value

Network Name

basecamp

RPC Endpoint

https://rpc.basecamp.t.raas.gelato.cloud

https://rpc-campnetwork.xyz

Chain ID

123420001114

Currency Symbol

CAMP

Block Explorer URL

https://basecamp.cloud.blockscout.com/

    Building On Camp

🦊Add Camp Network

Let's add Camp Network to your wallet!
Wallets

What is a Web3 Wallet?

A Web3 wallet facilitates interactions with the blockchain by managing your private and public keys, allowing you to transact digital assets and monitor balances. Protecting your private key is crucial, as losing it means losing access to your funds. Always download your wallet from official or reputable sources.

Since BaseCAMP is EVM compatible some common options are:

    MetaMask

    Coinbase Wallet

    Trust Wallet

    Rabby Wallet

    Taho

    OKX Wallet

You can read more about Ethereum wallets here.
How to Connect to Camp Network?

To manually add the network to your wallet follow these steps (written for MetaMask - but generally applicable here as well):

    Open 'Settings'

    Click on 'Networks'. This will display a list of networks that you've added already.

    Click 'Add network'

    MetaMask will open in a new tab in fullscreen mode. From here, find the 'Add a network manually' button at the bottom of the network list.

Complete the fields with the information pasted below the screenshot and click 'Save' to add the network.

Here are the corresponding fields for BaseCAMP:
Fields
Value

Network Name

basecamp

RPC Endpoint

https://rpc.basecamp.t.raas.gelato.cloud

https://rpc-campnetwork.xyz

Chain ID

123420001114

Currency Symbol

CAMP

Block Explorer URL

https://basecamp.cloud.blockscout.com/

    Origin V1

⚙️Origin Framework

What is the Origin Framework?
Welcome to Origin
Overview

The Origin platform is designed to onboard and manage intellectual property (IP) within Camp’s registry. It comprises two main components: the Origin APIs and the Origin Smart Contracts, which form the core of the system.

The Origin Smart Contracts consist of three major modules:

    IpNFT

    Marketplace

    Dispute Module

The Origin APIs are a suite of tools and resources that enable developers to integrate with and interact with the Origin platform. They provide a simple, consistent interface for accessing platform data and functionality, and support a wide range of authentication methods (including OAuth). Additionally, the APIs facilitate access to data from various third-party platforms—such as Spotify, Twitter, TikTok, and others—allowing developers to incorporate these services into their applications and leverage user data effectively within Camp’s registry.

    Origin V1

💡Getting Started

This is how to get started
🧩 Integrating Origin SDK into a React App to Create IP NFTs

Everything you need to go from an empty React project to a fully-featured IP-NFT minter.
Prerequisites

Before you start, make sure you have:

    Node ≥ 18 with npm or yarn

    A React 18 project (Vite, CRA, Next.js, etc.)

    Wallet integration (e.g. MetaMask or WalletConnect; Para SDK is optional)

    An Origin developer account to obtain your Client ID

    Environment variables:

    # .env
    VITE_ORIGIN_API=<YOUR-ORIGIN-API-URL>
    VITE_ORIGIN_CLIENT_ID=<YOUR-CAMP-CLIENT-ID>
    VITE_SUBGRAPH_URL=<YOUR-SUBGRAPH-URL>

        ⚠️ Replace these with actual values from your project. The provided URLs (e.g. api.origin.campnetwork.xyz) are placeholders.

    A small amount of $CAMP on the supported testnet (≥ 0.01) for gas

Installation

Install the core SDK and utilities:

# Origin SDK core + React hooks (already bundled)
npm i @campnetwork/origin viem

# Optional: Utilities used in this guide
npm i @tanstack/react-query @apollo/client graphql

    💡 @campnetwork/origin/react is already included in the main SDK, no need to install it separately.

Bootstrapping Providers

Set up your providers in src/main.tsx. Only CampProvider is required — others (Apollo, React Query, etc.) are optional based on your setup.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CampProvider } from "@campnetwork/origin/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import App from "./App";

const queryClient = new QueryClient();
const apollo = new ApolloClient({
  uri: import.meta.env.VITE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CampProvider clientId={import.meta.env.VITE_ORIGIN_CLIENT_ID}>
        <ApolloProvider client={apollo}>
          <App />
        </ApolloProvider>
      </CampProvider>
    </QueryClientProvider>
  </StrictMode>
);

    🛑 This example omits Para SDK for simplicity. Origin SDK already supports all EVM wallets and WalletConnect out of the box. Para is only needed if you're embedding wallets via OAuth.

Authenticating Users with Origin

Add the CampModal component anywhere in your app. It renders the authentication modal at the root and automatically injects a button where you place it.

import { CampModal } from "@campnetwork/origin/react";

export default function Auth() {
  return <CampModal />;
}

    ⚠️ If you’re using both Para and Origin in the same app, you can rename the useModal hook (e.g. useCampModal) to avoid naming collisions. For most apps, you can skip custom hooks and let the built-in modal handle everything.

To access authentication state and wallet-connected utilities:

const { jwt, origin, viem } = useAuth();
// jwt: Bearer token for API requests
// origin: SDK instance for minting/transferring NFTs
// viem: EIP-1193 provider

Calling the Origin API (Off-Chain)

Here are some examples of calling Origin’s REST API using the JWT token.
Generate AI Remix Images

export async function generateImage(model: "bear" | "fox" | "goat", jwt: string) {
  const res = await fetch(`${import.meta.env.VITE_ORIGIN_API}/auth/merv/generate-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model_type: model }),
  });
  const { data } = await res.json();
  return data.images as { id: string; url: string }[];
}

Check Generation Credits

export async function getCredits(jwt: string) {
  const res = await fetch(`${import.meta.env.VITE_ORIGIN_API}/auth/merv/check-generations`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const { data } = await res.json();
  return data.generations_left as number;
}

Assign Image After Mint

export async function assignImage(imageId: string, jwt: string) {
  await fetch(`${import.meta.env.VITE_ORIGIN_API}/auth/merv/assign-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_id: imageId }),
  });
}

Minting an IP-NFT

Here’s how to mint an NFT and assign a generated image:

import { useAuth } from "@campnetwork/origin/react";
import { assignImage } from "../utils/assignImage";

export default function MintButton({ file, imageId, meta }) {
  const { origin, jwt } = useAuth();

  const handleMint = async () => {
    if (!origin || !jwt) throw new Error("User not authenticated");

    const licence = {
      price: 0n,
      duration: 0n,
      royaltyBps: 0,
      paymentToken: "0x0000000000000000000000000000000000000000",
    } as const;

    const parentId = 4n; // optional: define if this is a derivative
    await origin.mintFile(file, meta, licence, parentId);
    await assignImage(imageId, jwt);
  };

  return <button onClick={handleMint}>Mint NFT</button>;
}

What mintFile() Does:

    Uploads your file and metadata to IPFS/Filecoin

    Calls the IP-NFT smart contract’s mint function

    Writes the licensing terms on-chain

Optional: Para SDK Integration

If you want embedded wallets or OAuth flows, you can integrate Para by:

    Calling generateProvider() to create a custom wallet provider

    Passing that provider to CampModal via the provider prop

For the sake of simplicity, this guide focuses on wallet-agnostic integration using Origin SDK only.

    Origin V1

🔥Origin SDK

Everything about the Origin SDK!

The Origin SDK currently exposes the following modules:

    "@campnetwork/origin" - The main entry point for the SDK, exposes the following classes:

        TwitterAPI - For fetching user Twitter data from the Auth Hub

        SpotifyAPI - For fetching user Spotify data from the Auth Hub

        Auth - For authenticating users with the Origin SDK

    "@campnetwork/origin/react" - Exposes the CampProvider and CampContext, as well as React components and hooks for authentication and fetching user data via the Camp Auth Hub

Installation

npm install @campnetwork/origin

Core

The core modules can be imported either as a CommonJS module or as an ES6 module.
CommonJS

const { TwitterAPI, SpotifyAPI, Auth } = require("@campnetwork/origin");

ES6

import { TwitterAPI, SpotifyAPI, Auth } from "@campnetwork/origin";

Socials
TwitterAPI

The TwitterAPI class is the entry point for fetching user Twitter data from the Auth Hub. It requires an API key to be instantiated.

Note: The methods for fetching data will only return data for users who have authenticated to your app via the Origin SDK.

Constructor

apiKey - The API key of your app.

const twitter = new TwitterAPI({
  apiKey: string,
});

Methods

fetchUserByUsername

fetchUserByUsername(twitterUserName: string)

const user = await twitter.fetchUserByUsername("jack");

fetchTweetsByUsername

fetchTweetsByUsername(twitterUserName: string, page: number, limit: number)

const tweets = await twitter.fetchTweetsByUsername("jack", 1, 10);

fetchFollowersByUsername

fetchFollowersByUsername(twitterUserName: string, page: number, limit: number)

const followers = await twitter.fetchFollowersByUsername("jack", 1, 10);

fetchFollowingByUsername

fetchFollowingByUsername(twitterUserName: string, page: number, limit: number)

const following = await twitter.fetchFollowingByUsername("jack", 1, 10);

fetchTweetById

fetchTweetById(tweetId: string)

const tweet = await twitter.fetchTweetById("1234567890");

fetchUserByWalletAddress

fetchUserByWalletAddress(walletAddress: string, page: number, limit: number)

const user = await twitter.fetchUserByWalletAddress("0x1234567890", 1, 10);

fetchRepostedByUsername

fetchRepostedByUsername(twitterUserName: string, page: number, limit: number)

const reposts = await twitter.fetchRepostedByUsername("jack", 1, 10);

fetchRepliesByUsername

fetchRepliesByUsername(twitterUserName: string, page: number, limit: number)

const replies = await twitter.fetchRepliesByUsername("jack", 1, 10);

fetchLikesByUsername

fetchLikesByUsername(twitterUserName: string, page: number, limit: number)

const likes = await twitter.fetchLikesByUsername("jack", 1, 10);

fetchFollowsByUsername

fetchFollowsByUsername(twitterUserName: string, page: number, limit: number)

const follows = await twitter.fetchFollowsByUsername("jack", 1, 10);

fetchViewedTweetsByUsername

fetchViewedTweetsByUsername(twitterUserName: string, page: number, limit: number)

const viewedTweets = await twitter.fetchViewedTweetsByUsername("jack", 1, 10);

SpotifyAPI

The SpotifyAPI class is the entry point for fetching user Spotify data from the Auth Hub. It requires an API key to be instantiated.

Note: The methods for fetching data will only return data for users who have authenticated to your app via the Origin SDK.

Constructor

apiKey - The API key of your app.

const spotify = new SpotifyAPI({
  apiKey: string,
});

Methods

fetchSavedTracksById

fetchSavedTracksById(spotifyId: string)

const savedTracks = await spotify.fetchSavedTracksById("1234567890");

fetchPlayedTracksById

fetchPlayedTracksById(spotifyId: string)

const playedTracks = await spotify.fetchPlayedTracksById("1234567890");

fetchSavedAlbumsById

fetchSavedAlbumsById(spotifyId: string)

const savedAlbums = await spotify.fetchSavedAlbumsById("1234567890");

fetchSavedPlaylistsById

fetchSavedPlaylistsById(spotifyId: string)

const savedPlaylists = await spotify.fetchSavedPlaylistsById("1234567890");

fetchTracksInAlbum

fetchTracksInAlbum(spotifyId: string, albumId: string)

const tracks = await spotify.fetchTracksInAlbum("1234567890", "1234567890");

fetchTracksInPlaylist

fetchTracksInPlaylist(spotifyId: string, playlistId: string)

const tracks = await spotify.fetchTracksInPlaylist("1234567890", "1234567890");

fetchUserByWalletAddress

fetchUserByWalletAddress(walletAddress: string)

const user = await spotify.fetchUserByWalletAddress("0x1234567890");

TikTokAPI

The TikTok API class is the entry point for fetching user TikTok data from the Auth Hub. It requires an API key to be instantiated.

Note: The methods for fetching data will only return data for users who have authenticated to your app via the Origin SDK.

Constructor

apiKey - The API key of your app.

const tiktok = new TikTokAPI({
  apiKey: string,
});

Methods

fetchUserByUsername

fetchUserByUsername(tiktokUserName: string)

const user = await tiktok.fetchUserByUsername("jack");

fetchVideoById

fetchVideoById(userHandle: string, videoId: string)

const video = await tiktok.fetchVideo("jack", "1234567890");

Auth

The Auth class is the entry point for authenticating users with the Origin SDK. It requires a clientId to be instantiated.

Note: The Auth class is only to be used on the client side.
Constructor

    clientId - The client ID of your app. This is required to authenticate users with the Origin SDK.

    redirectUri - The URI to redirect to after the user completes oauth for any of the socials. Defaults to window.location.href. The redirectUri can also be an object with the following optional properties:

        twitter - The URI to redirect to after the user completes oauth for Twitter.

        discord - The URI to redirect to after the user completes oauth for Discord.

        spotify - The URI to redirect to after the user completes oauth for Spotify.

    allowAnalytics - Whether to allow analytics to be collected. Defaults to true.

You may use the redirectUri object to redirect the user to different pages based on the social they are linking. You may only define the URIs for the socials you are using, the rest will default to window.location.href.

import { Auth } from "@campnetwork/origin";

const auth = new Auth({
  clientId: string,
  redirectUri: string | object,
  allowAnalytics: boolean,
});

const auth = new Auth({
  clientId: "your-client-id",
  redirectUri: {
    twitter: "https://your-website.com/twitter",
    discord: "https://your-website.com/discord",
    spotify: "https://your-website.com/spotify",
  },
});

Methods

connect

connect() => void

The connect method prompts the user to sign a message with their wallet in order to authenticate with the Origin SDK. The wallet provider can be set by calling the setProvider method on the Auth instance beforehand. The default provider used is window.ethereum.

auth.connect();

disconnect

disconnect() => void

The disconnect method logs the user out of the Origin SDK on the client side.

auth.disconnect();

setProvider

setProvider(provider: { provider: EIP1193Provider, info: EIP6963ProviderInfo }) => void

Read more about the EIP1193Provider and EIP6963ProviderInfo interfaces.

The setProvider method sets the wallet provider to be used for authentication.

auth.setProvider({
  provider: window.ethereum,
  info: { name: "MetaMask", icon: "https://..." },
});

setWalletAddress

setWalletAddress(walletAddress: string) => void

The setWalletAddress method sets the wallet address to be used for authentication (via the connect method).

This is only needed if the provider does not support the eth_requestAccounts method. Only use this method if you are sure you need to set the wallet address manually.

auth.setWalletAddress("0x1234567890");

on

on(event: string, callback: (data: any) => void) => void

The on method listens for events emitted by the Auth module of the Origin SDK.

The following events are emitted:

"state"

Possible states:

    authenticated - The user has successfully authenticated.

    unauthenticated - The user has been logged out.

    loading - The user is in the process of authenticating.

auth.on("state", (data) => {
  console.log(data); // "authenticated" | "unauthenticated" | "loading"
});

"provider"

Returns the provider that has been set via the setProvider method. If using the Origin SDK React components, this event is emitted when the user selects a provider in the Auth modal.

auth.on("provider", (data) => {
  console.log(data); // { provider: EIP1193Provider, info: EIP6963ProviderInfo }
});

"providers"

Returns the list of providers that have been injected via EIP6963 and that the user can select from.

auth.on("providers", (data) => {
  console.log(data); // [{ provider: EIP1193Provider, info: EIP6963ProviderInfo }]
});

You may use this event to update the UI with the available providers. The user can then select a provider to authenticate with, and the setProvider method can be called with the selected provider. The connect method can then be called to authenticate the user.

auth.on("providers", (data) => {
  // Update UI with providers
  // User selects a provider
  const selectedProvider = data[0];

  auth.setProvider(selectedProvider);

  auth.connect();
});

getLinkedSocials

getLinkedSocials() => Promise<{ twitter: boolean, discord: boolean, spotify: boolean }>

The getLinkedSocials method returns a promise that resolves to an object containing the possible socials that the user can link and whether they are linked or not.

const linkedSocials = await auth.getLinkedSocials();

console.log(linkedSocials); // { twitter: true, discord: false, spotify: true }

After the user has authenticated, the following methods can be used to link and unlink social accounts. When linking a social account, the user will be redirected to the OAuth flow for that social platform. Afterwards, the user will be redirected back to the redirectUri specified in the Auth constructor.

linkTwitter

linkTwitter() => void

The linkTwitter method redirects the user to the Twitter OAuth flow to link their Twitter account to the Auth Hub.

auth.linkTwitter();

linkDiscord

linkDiscord() => void

The linkDiscord method redirects the user to the Discord OAuth flow to link their Discord account to the Auth Hub.

auth.linkDiscord();

linkSpotify

linkSpotify() => void

The linkSpotify method redirects the user to the Spotify OAuth flow to link their Spotify account to the Auth Hub.

auth.linkSpotify();

linkTikTok

linkTikTok(handle: string) => Promise<void>

The linkTikTok method links the provided TikTok handle to the Auth Hub.

auth.linkTikTok("tiktokhandle");

sendTelegramOTP

sendTelegramOTP(phoneNumber: string) => Promise<void> The sendTelegramOTP method sends an OTP to the provided phone number via Telegram. The OTP can be used via the linkTelegram method to link the user's Telegram account to the Auth Hub.

const { phone_code_hash } = await auth.sendTelegramOTP("+1234567890");

linkTelegram

linkTelegram(phoneNumber: string, otp: string, phoneCodeHash: string) => Promise<void>

The linkTelegram method links the provided phone number to the Auth Hub using the OTP and phone code hash received from the sendTelegramOTP method.

await auth.linkTelegram("+1234567890", "123456", "abc123");

unlinkTwitter

unlinkTwitter() => Promise<void>

The unlinkTwitter method unlinks the user's Twitter account from the Auth Hub.

await auth.unlinkTwitter();

unlinkDiscord

unlinkDiscord() => Promise<void>

The unlinkDiscord method unlinks the user's Discord account from the Auth Hub.

await auth.unlinkDiscord();

unlinkSpotify

unlinkSpotify() => Promise<void>

The unlinkSpotify method unlinks the user's Spotify account from the Auth Hub.

await auth.unlinkSpotify();

unlinkTikTok

unlinkTikTok() => Promise<void>

The unlinkTikTok method unlinks the user's TikTok account from the Auth Hub.

await auth.unlinkTikTok();

unlinkTelegram

unlinkTelegram() => Promise<void> The unlinkTelegram method unlinks the user's Telegram account from the Auth Hub.

await auth.unlinkTelegram();

React

The React components and hooks can be imported as ES6 modules. The example below shows how to set up the CampProvider component and subsequently use the provided hooks and components.

// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CampProvider } from "@campnetwork/origin/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CampProvider clientId="your-client-id">
        <App />
      </CampProvider>
    </QueryClientProvider>
  </StrictMode>
);

CampProvider

The CampProvider component requires a clientId prop to be passed in order link the users to your app. It can also take the following optional props:

    redirectUri - string | object - Either a string that will be used as the redirect URI for all socials, or an object with the following optional properties: twitter, discord, spotify. This is used to redirect the user to different pages after they have completed the OAuth flow for a social.

import { CampProvider } from "@campnetwork/origin/react";
// ...
function App() {
  return (
    <CampProvider
      clientId="your-client-id"
      redirectUri="https://your-website.com"
    >
      <div>Your app</div>
    </CampProvider>
  );
}

Or, with an object for the redirectUri:

import { CampProvider } from "@campnetwork/origin/react";
// ...
function App() {
  return (
    <CampProvider
      clientId="your-client-id"
      redirectUri={{
        twitter: "https://your-website.com/twitter",
        discord: "https://your-website.com/discord",
        spotify: "https://your-website.com/spotify",
      }}
    >
      <div>Your app</div>
    </CampProvider>
  );
}

The CampProvider component sets up the context for the Origin SDK and provides the Auth instance to the rest of the app.
CampModal

The CampModal is a one-line* solution for authenticating users with the Origin SDK. It can be used to connect users to the Auth Hub and link and unlink social accounts.

It works as follows:

The CampModal component displays a button with the text "Connect" that the user can click on in order to summon the modal. The modal shows a list of available providers that the user can select from. After a provider has been selected, the connect method is called on the Auth instance to authenticate the user.

If the user is already authenticated, the button will instead say "My Camp" and the modal will display the user's Camp profile information and allow them to link and unlink social accounts.

The CampModal can take the following props:

    wcProjectId - string - The WalletConnect project ID to use for authentication. Allows the users to authenticate via WalletConnect.

    injectButton - boolean - Whether to inject the button into the DOM or not. Defaults to true. If set to false, the button will not be rendered and the modal can be opened programmatically via the openModal function returned by the useModal hook.

    onlyWagmi - boolean - Whether to only show the provider that the user is currently authenticated with. Defaults to false.

    defaultProvider - { provider: EIP1193Provider, info: EIP6963ProviderInfo, exclusive: boolean } - Custom provider to set as the highlighted provider in the modal. If not set, the wagmi provider will be highlighted if it is available. The exclusive property can be set to true to only show this provider in the modal.

    allowAnalytics - boolean - Whether to allow analytics to be collected. Defaults to true.

Usage

Basic usage of the CampModal component:

import { CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal />
    </div>
  );
}

With custom props:

import { CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal
        wcProjectId="your-wc-project-id"
        defaultProvider={{
          provider: window.ethereum,
          info: { name: "MetaMask", icon: "https://..." },
          exclusive: false,
        }}
      />
    </div>
  );
}

You can find more examples here.

Only show the provider that the user is currently authenticated with (if using wagmi):

import { CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal onlyWagmi />
    </div>
  );
}

Users can be authenticated either via the Camp Modal as outlined above or programmatically by calling the connect method on the Auth instance.
Usage with third party providers (Privy, Appkit, Magic, etc.)

The Camp Modal can be used in conjunction with providers such as Privy and Appkit to create a seamless authentication experience for users. When using wagmi, it will automatically detect if the user is authenticated via a third party provider and give them the option to connect to the Auth Hub using that provider. Otherwise, you can set up the default provider to be whatever provider you are using.

Example usage with Privy

Example usage with Appkit

Example usage with magic.link

After the user has authenticated, you can use the provided hooks to fetch user data and listen for events.
LinkButton

The LinkButton component is a button that can be used to link and unlink social accounts. Under the hood it uses the useLinkModal hook to open the Link Socials modal.

The LinkButton can take the following props:

    social - string - The social account to link or unlink. Can be one of: twitter, discord, spotify.

    variant - string - The variant of the button. Can be one of: default, icon. Defaults to default.

    theme - string - The theme of the button. Can be one of: default, camp. Defaults to default.

Note: The <CampModal/> component must be rendered in the component tree for the buttons to work.
Usage

Basic usage of the LinkButton component:

import { LinkButton, CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal />
      <LinkButton social="twitter" />
      <LinkButton social="discord" variant="icon" />
      <LinkButton social="spotify" theme="camp" />
      <LinkButton social="tiktok" variant="icon" theme="camp" />
      <LinkButton social="telegram" />
    </div>
  );
}

Hooks

useAuth

The useAuth hook returns the instance of the Auth class that is provided by the CampProvider. It can be used as outlined in the Core section in order to build custom authentication flows, listen for events, and fetch user data.

import { useAuth } from "@campnetwork/origin/react";

function App() {
  const auth = useAuth();

  return (
    <div>
      <button onClick={auth.connect}>Connect</button>
    </div>
  );
}

useAuthState

The useAuthState hook returns the current authentication state of the user.

import { useAuthState } from "@campnetwork/origin/react";

function App() {
  const { authenticated, loading } = useAuthState();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {authenticated && <div>Authenticated</div>}
    </div>
  );
}

useProvider

The useProvider hook returns the provider that has been set via the setProvider method, as well as a setProvider function that can be used to update the provider.

import { useProvider } from "@campnetwork/origin/react";

function App() {
  const { provider, setProvider } = useProvider();

  return (
    <div>
      <div>Current provider: {provider.info.name}</div>
      <button
        onClick={() =>
          setProvider({ provider: window.ethereum, info: { name: "Metamask" } })
        }
      >
        Set Provider
      </button>
    </div>
  );
}

useProviders

The useProviders hook returns the list of providers that have been injected via EIP6963 and that the user or app can select from.

import { useProviders, useProvider } from "@campnetwork/origin/react";

function App() {
  const providers = useProviders();
  const { setProvider } = useProvider();

  return (
    <div>
      {providers.map((provider) => (
        <button key={provider.info.name} onClick={() => setProvider(provider)}>
          {provider.info.name}
        </button>
      ))}
    </div>
  );
}

useConnect

The useConnect hook returns functions that can be used to connect and disconnect the user.

import { useConnect, useAuthState } from "@campnetwork/origin/react";

function App() {
  const { connect, disconnect } = useConnect();
  const { authenticated } = useAuthState();

  return (
    <div>
      {authenticated ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}

useSocials

The useSocials hook returns the state of the user's linked social accounts.

import { useSocials } from "@campnetwork/origin/react";

function App() {
  const { data, error, isLoading } = useSocials();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>Twitter: {data.twitter ? "Linked" : "Not linked"}</div>
      <div>Discord: {data.discord ? "Linked" : "Not linked"}</div>
      <div>Spotify: {data.spotify ? "Linked" : "Not linked"}</div>
    </div>
  );
}

useLinkSocials

The useLinkSocials hook returns functions that can be used to link and unlink social accounts.

import { useLinkSocials } from "@campnetwork/origin/react";

function App() {
  const {
    linkTwitter,
    linkDiscord,
    linkSpotify,
    linkTiktok,
    linkTelegram,
    sendTelegramOTP,
    unlinkTwitter,
    unlinkDiscord,
    unlinkSpotify,
    unlinkTiktok,
    unlinkTelegram,
  } = useLinkSocials();

  return (
    <div>
      <button onClick={linkTwitter}>Link Twitter</button>
      <button onClick={linkDiscord}>Link Discord</button>
      <button onClick={linkSpotify}>Link Spotify</button>
      <button onClick={() => linkTiktok("tiktokhandle")}>Link TikTok</button>
      <button onClick={() => sendTelegramOTP("+1234567890")}>
        Send Telegram OTP
      </button>
      <button onClick={() => linkTelegram("+1234567890", "123456", "abc123")}>
        Link Telegram
      </button>
      <button onClick={unlinkTwitter}>Unlink Twitter</button>
      <button onClick={unlinkDiscord}>Unlink Discord</button>
      <button onClick={unlinkSpotify}>Unlink Spotify</button>
      <button onClick={unlinkTiktok}>Unlink TikTok</button>
      <button onClick={unlinkTelegram}>Unlink Telegram</button>
    </div>
  );
}

useModal

The useModal hook returns the state of the Auth and My Camp modals, as well as functions to show and hide them.

Note: The <CampModal/> component must be rendered in the component tree for the modals to be displayed.

import { useModal, CampModal } from "@campnetwork/origin/react";

function App() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      <button onClick={closeModal}>Close Modal</button>
      <CampModal injectButton={false} />
    </div>
  );
}

The state and functions returned by the useModal hook can be used to show and hide the Auth and My Camp modals, as well as to check if they are currently open. The modal being controlled is dictated by the user's authentication state.
useLinkModal

The useLinkModal hook returns the state of the Link Socials modal, as well as functions to show and hide it.

Note: The <CampModal/> component must be rendered in the component tree for the modal to be displayed.

import { useLinkModal, CampModal } from "@campnetwork/origin/react";

function App() {
  const { isLinkingOpen, openTwitterModal } = useLinkModal();

  return (
    <div>
      <CampModal />
      <button onClick={openTwitterModal}>Link Twitter</button>
    </div>
  );
}

It returns the following properties and functions:

    isLinkingOpen - boolean - Whether the Link Socials modal is open or not.

    openTwitterModal - () => void

    openDiscordModal - () => void

    openSpotifyModal - () => void

    openTiktokModal - () => void

    openTelegramModal - () => void

    linkTwitter - () => void

    linkDiscord - () => void

    linkSpotify - () => void

    linkTiktok - () => void

    linkTelegram - () => void

    unlinkTwitter - () => void

    unlinkDiscord - () => void

    unlinkSpotify - () => void

    unlinkTiktok - () => void

    unlinkTelegram - () => void

    closeModal - () => void

The difference between the openXModal functions and the linkX / unlinkX functions is that the former opens the modal regardless of the user's linking state, allowing them to either link or unlink their account, while the latter only opens the specified modal if the user's linking state allows for it.

For example, if the user is linked to Twitter, calling openTwitterModal will open the modal to unlink their Twitter account, while calling linkTwitter will not do anything, and calling unlinkTwitter will open the modal to unlink their Twitter account.
Origin Methods (auth.origin)

The Origin class provides methods for interacting with Origin IpNFTs, uploading files, managing user stats, and more. You can access these methods via auth.origin after authentication.
Types

LicenseTerms

The license terms object used in minting and updating methods:

type LicenseTerms = {
  price: bigint; // Price in wei
  duration: number; // Duration in seconds
  royaltyBps: number; // Royalty in basis points (0-10000)
  paymentToken: Address; // Payment token address (address(0) for native currency)
};

File Upload & Minting

mintFile(file: File, metadata: Record<string, unknown>, license: LicenseTerms, parentId?: bigint, options?: { progressCallback?: (percent: number) => void })

Uploads a file and mints an IpNFT for it.

    file: The file to upload and mint.

    metadata: Additional metadata for the IpNFT.

    license: License terms for the IpNFT (price, duration, royalty, payment token).

    parentId: Optional parent token ID for derivative works.

    options.progressCallback: Optional progress callback.

    Returns: The minted token ID as a string, or throws an error on failure.

mintSocial(source: "spotify" | "twitter" | "tiktok", license: LicenseTerms)

Mints an IpNFT for a connected social account.

    source: The social platform.

    license: License terms for the IpNFT.

    Returns: The minted token ID as a string, or throws an error on failure.

IpNFT & Marketplace Methods

The following methods are available for interacting with IpNFTs and the marketplace. All methods mirror the smart contract functions and require appropriate permissions.

Core IP NFT Methods

    mintWithSignature(account: string, tokenId: bigint, parentId: bigint, creatorContentHash: string, uri: string, license: LicenseTerms, deadline: bigint, signature: string) - Mint an IpNFT with a signature

    registerIpNFT(source: string, deadline: bigint, license: LicenseTerms, metadata: Record<string, unknown>, fileKey?: string, parentId?: bigint) - Register an IpNFT for minting

    updateTerms(tokenId: bigint, license: LicenseTerms) - Update license terms for an IpNFT

    requestDelete(tokenId: bigint) - Request deletion of an IpNFT

    getTerms(tokenId: bigint) - Get license terms for an IpNFT

    ownerOf(tokenId: bigint) - Get the owner of an IpNFT

    balanceOf(owner: string) - Get the balance of IpNFTs for an owner

    contentHash(tokenId: bigint) - Get the content hash of an IpNFT

    tokenURI(tokenId: bigint) - Get the metadata URI of an IpNFT

    dataStatus(tokenId: bigint) - Get the data status of an IpNFT

    royaltyInfo(tokenId: bigint, value: bigint) - Get royalty information

    getApproved(tokenId: bigint) - Get the approved address for an IpNFT

    isApprovedForAll(owner: string, operator: string) - Check if operator is approved for all tokens

    transferFrom(from: string, to: string, tokenId: bigint) - Transfer an IpNFT

    safeTransferFrom(from: string, to: string, tokenId: bigint) - Safely transfer an IpNFT

    approve(to: string, tokenId: bigint) - Approve an address for a specific IpNFT

    setApprovalForAll(operator: string, approved: boolean) - Set approval for all tokens

Marketplace Methods

    buyAccess(tokenId: bigint, periods: number, value?: bigint) - Buy access to an IpNFT

    renewAccess(tokenId: bigint, periods: number) - Renew access to an IpNFT

    hasAccess(tokenId: bigint, user: string) - Check if user has access to an IpNFT

    subscriptionExpiry(tokenId: bigint, user: string) - Get subscription expiry for a user

    See the SDK source or contract ABI for full parameter details.

buyAccessSmart(tokenId: bigint, periods: number)

Buys access to an asset, handling payment approval if needed.

    tokenId: The IpNFT token ID.

    periods: Number of periods to buy.

    Returns: Result of the buy access transaction.

getData(tokenId: bigint)

Fetches metadata for a given IpNFT.

    tokenId: The IpNFT token ID.

    Returns: Data object for the token.

User Data & Stats

getOriginUploads()

Fetches the user's Origin file uploads.

    Returns: Array of upload data, or null on failure.

getOriginUsage()

Fetches the user's Origin stats (multiplier, points, usage, etc).

    Returns: Object with user stats including:

        user.multiplier - User's Origin multiplier

        user.points - User's Origin points

        user.active - Whether user's Origin is active

        teams - Array of team data

        dataSources - Array of data source information

setOriginConsent(consent: boolean)

Sets the user's consent for Origin usage.

    consent: true or false.

    Returns: Promise that resolves on success, throws APIError on failure.

Utility Methods

getJwt()

Gets the current JWT token.

    Returns: The JWT string.

setViemClient(client: any)

Sets the viem wallet client for blockchain interactions.

    client: The viem wallet client instance.

You can call these methods as await auth.origin.methodName(...) after authenticating with the SDK. For more details, see the inline code documentation.
Contributing

Install the dependencies.

npm install

Build the SDK.

npm run build

This will generate the SDK in the dist folder.

You can also run the following command to watch for changes and rebuild the SDK automatically:

npm run dev

In order to use the sdk in a local project, you can link the sdk to the project.

npm link

Then, in the project you want to use the sdk in, run:

npm link @campnetwork/origin

This will link the local sdk to the project.

    Origin V1

⚒️Origin Protocol

Onchain Data Marketplace ‑-IP Registry

A trust-minimised marketplace where creators mint data feeds as NFTs and buyers purchase time-boxed subscriptions. The whole revenue split is enforced on-chain.

For preventing infringed/fraudulent ip content from being monetised, we have a dispute module in place where anyone can raise a dispute against a potentially infringed/fraudulent ip and depending on the resolution it would prevent further subscriptions from that ip.
High Level Architecture
Contracts Overview

IP NFT

    Serves as the central component of the system, representing tokenized intellectual property rights through the ERC721 token standard.

    Mints are done through EIP-712 verification.

    The mintWithSignature function accepts an array of parent id’s with a maximum of 8 parents, in case a derivative ip is to be minted and a call is made to the MarketPlace contract to verify the parent-derivative/child relationship and setting it in storage for royalty payments, dispute propagation etc.

    Handles delete functionality for the minted ip content and allows the DisputeModule to mark a ip as disputed based on the resolution.

MarketPlace

    Handles subscription purchases for Ip’s when the buyAccess function is called

    Handles royalty payments to the ip’s and its parent ip holders too in case of derivative ip’s.

    To prevent DOS attacks during royalty transfers, we have a royalty vault for each creator where the royalty is sent too and they can claim it accordingly.

    Handles treasury fee distribution too on every subscription purchase.

Dispute Module

    Allows anyone to raise a dispute against a potentially infringed/fraudulent IP and provides evidence and a fixed dispute bond in $wCAMP by calling the raiseDispute function.

    The ip against which the dispute was raised, its owner can assert that dispute providing counter evidence within a fixed dispute cooldown period by calling the disputeAssertion function.

    Once the dispute cooldown for a specific dispute is over, the camp dao committee can judge the dispute off-chain and resolve it on-chain by calling setDisputeJudgement function.

    Within the dispute cooldown period as long as it has not been asserted the dispute initiator can cancel it by calling cancelDispute function.

    Anyone can also call the tagChildIp function to raise a dispute against a derivative ip whose parent has already been disputed.

Royalty Vault

    It is deployed for each creator on each mint

    It is used to send royalties for all type of ip's

    The creator to which the vault belongs can call the claimRoyalty function to claim royalties.


    Origin V1
    🎊Social APIs

X

A list of Twitter APIs

baseURL: wv2h4to5qa.execute-api.us-east-2.amazonaws.com/dev/twitter

Authentication

All requests require a valid API key to be included in the x-api-key header.

To obtain x-api-key please contact the team. You can find more information at the "Connect With Us" section
LogoCamp Auth APIsCamp APIs
Fetch Twitter User by Username

GET https://<baseURL>/user

Fetches the details of a Twitter user by their username

    For the client to access data, Twitter users need to authenticate through Origin.

Query Parameters
Name
Type
Description

twitterUserName*

string

The username of the Twitter user

{
    "isError": false,
    "data": {
        "id": "1781088676375625728",
        "displayName": "TestAccount",
        "userHandle": "testAccount",
        "profileBio": "This is my test account",
        "profilePictureUrl": "https://pbs.twimg.com/profile_images/1781088718637371392/IW7Wnnv9_normal.png",
        "isVerified": false,
        "isBlueVerified": false,
        "verifiedType": "",
        "location": "",
        "likeCount": 23,
        "followerCount": 48,
        "followingCount": 23,
        "dailyTweetCount": null,
        "weeklyTweetCount": null,
        "tweetFrequencyInDays": null
    },
    "message": ""
}

Fetch Tweets by Twitter Username

GET https://<baseURL>/tweets

Fetches the tweets of a Twitter user by their username

    For the client to access data, Twitter users need to authenticate through Origin.

    Please note that tweet statistics aren't updated in real time on this display. For the latest stats, use the command /gettweetbyid below.

Query Parameters
Name
Type
Description

twitterUserName*

string

The username of the Twitter user

page

number

The current page number in the pagination. It represents which set of records you want to retrieve.

limit

number

The number of records to retrieve per page.

{
    "isError": false,
    "data": [
                {
                    "id": "1836877589161410907",
                    "twitterUserId": "1781088676375625728",
                    "tweetText": "lezz go",
                    "tweetTimestamp": "2024-09-19T21:18:39.000Z",
                    "likeCount": 0,
                    "retweetCount": 0,
                    "replyCount": 0,
                    "quoteCount": 0,
                    "isReTweet": false,
                    "replyToTweetId": null,
                    "tweetedBy": null,
                    "replyToUserId": null
                }
          ],
    "message": ""
}

Fetch Tweet By Tweet id

GET https://<baseURL>/gettweetbyid

Fetches the tweet of a Twitter user by tweetId 

    For the client to access data, Twitter users need to authenticate through Origin.

Query Parameters
Name
Type
Description

tweetId*

string

The tweet id of tweet

{
    "isError": false,
    "data": {
        "tweetData": {
            "id": "1843987335744295320",
            "tweetText": "How to create a perfect CT founder image:\n\n- Activate founder mode (make sure everyone thinks you never sleep)\n- Buzzword overload (if it’s confusing, it must be genius)\n- Act extra nerdy (the more obscure the tech reference, the more legit you seem)",
            "tweetTimestamp": "2024-10-09T12:10:15.000Z",
            "likeCount": 60,
            "retweetCount": 0,
            "replyCount": 11,
            "quoteCount": 1,
            "mediaUrls": [],
            "userMentions": [],
            "hashtags": [],
            "createdAt": "2024-10-09T13:57:52.368Z",
            "updatedAt": "2024-10-09T13:57:52.368Z"
        }
    },
    "message": ""
}

Fetch Twitter User by Wallet Address

GET https://<baseURL>/wallet-twitter-data

Fetches the details of a Twitter user by their wallet address

    For the client to access data, Twitter users need to authenticate through Origin.

Query Parameters
Name
Type
Description

walletAddress*

string

The registered wallet address of the user

{
    "isError": false,
    "data": {
        "twitterUser": {
            "id": "1781088676375625728",
            "displayName": "CharleneTest",
            "userHandle": "charlene_n89400",
            "profileBio": "This is my test account",
            "profilePictureUrl": "https://pbs.twimg.com/profile_images/1781088718637371392/IW7Wnnv9_normal.png",
            "isVerified": false,
            "isBlueVerified": false,
            "verifiedType": "",
            "location": "",
            "likeCount": 23,
            "followerCount": 48,
            "followingCount": 23,
            "dailyTweetCount": null,
            "weeklyTweetCount": null,
            "tweetFrequencyInDays": null,
            "lastSynced": "2024-10-04T23:30:23.849Z",
            "accessToken": null,
            "refreshToken": null,
            "tokenLastUpdatedAt": "2024-09-25T16:36:26.462Z",
            "createdAt": "2024-10-01T20:25:33.983Z",
            "updatedAt": "2024-10-01T20:25:33.983Z"
        },
        "tweets": [
            {
                "id": "1836877589161410907",
                "twitterUserId": "1781088676375625728",
                "tweetText": "lezz go",
                "tweetTimestamp": "2024-09-19T21:18:39.000Z",
                "likeCount": 0,
                "retweetCount": 0,
                "replyCount": 0,
                "quoteCount": 0,
                "isReTweet": false,
                "replyToTweetId": null,
                "tweetedBy": null,
                "replyToUserId": null
            } ....
        ],
        "followers": [
            {
                "id": "7e0b256e-472b-4168-b23e-171254adeb3d",
                "userId": "1781088676375625728",
                "twitterUserId": "1821239367559737344",
                "userHandle": "SeseloshHW69gS",
                "displayName": "Seselosh",
                "type": "follower",
                "orderId": 51,
                "location": ""
            } ....
        ],
        "followings": [
            {
                "id": "7973eddf-5726-44a3-883a-ba09e6419322",
                "userId": "1781088676375625728",
                "twitterUserId": "2885754653",
                "userHandle": "TheSonOfWalkley",
                "displayName": "TheSonOfWalkley",
                "type": "following",
                "orderId": 3,
                "location": "McDonald’s"
            } ....
        ]
    },
    "message": ""
}

Fetch Users Reposted

GET https://<baseURL>/reposted

Fetches the reposted tweets by their username

    For the client to access data, Twitter users need to authenticate through Origin.

Query Parameters
Name
Type
Description

twitterUserName*

string

The username of the Twitter user

page

number

The current page number in the pagination. It represents which set of records you want to retrieve.

limit

number

The number of records to retrieve per page.

{
    "isError": false,
    "data": [
        {
            "id": "1828113463073272223",
            "twitterUserId": "1781088676375625728",
            "tweetText": "RT @elonmusk: Video of the inside of Cortex today, the giant new AI training supercluster being built at Tesla HQ in Austin to solve real-w…",
            "tweetTimestamp": "2024-08-26T16:53:08.000Z",
            "likeCount": 0,
            "retweetCount": 52292,
            "replyCount": 0,
            "quoteCount": 0,
            "isReTweet": true,
            "replyToTweetId": "",
            "tweetedBy": "1781088676375625728",
            "replyToUserId": ""
        },
        {
            "id": "1828113190783459747",
            "twitterUserId": "1781088676375625728",
            "tweetText": "RT @elonmusk: https://t.co/X6LehWFrrY",
            "tweetTimestamp": "2024-08-26T16:52:04.000Z",
            "likeCount": 0,
            "retweetCount": 32738,
            "replyCount": 0,
            "quoteCount": 0,
            "isReTweet": true,
            "replyToTweetId": "",
            "tweetedBy": "1781088676375625728",
            "replyToUserId": ""
        }
    ],
    "message": ""
}

Fetch Users Replies

GET https://<baseURL>/replies

Fetches the Retweets/Quoted/Replies by their username

    For the client to access data, Twitter users need to authenticate through Origin.

Query Parameters
Name
Type
Description

twitterUserName*

string

The username of the Twitter user

page

number

The current page number in the pagination. It represents which set of records you want to retrieve.

limit

number

The number of records to retrieve per page.

{
    "isError": false,
    "data": [
        {
            "replied": {
                "id": "1828113463073272223",
                "twitterUserId": "1781088676375625728",
                "tweetText": "RT @elonmusk: Video of the inside of Cortex today, the giant new AI training supercluster being built at Tesla HQ in Austin to solve real-w…",
                "tweetTimestamp": "2024-08-26T16:53:08.000Z",
                "likeCount": 0,
                "retweetCount": 52292,
                "replyCount": 0,
                "quoteCount": 0,
                "isReTweet": true,
                "replyToTweetId": "",
                "tweetedBy": "1781088676375625728",
                "replyToUserId": ""
            }
        },
        {
            "replied": {
                "id": "1828113190783459747",
                "twitterUserId": "1781088676375625728",
                "tweetText": "RT @elonmusk: https://t.co/X6LehWFrrY",
                "tweetTimestamp": "2024-08-26T16:52:04.000Z",
                "likeCount": 0,
                "retweetCount": 32738,
                "replyCount": 0,
                "quoteCount": 0,
                "isReTweet": true,
                "replyToTweetId": "",
                "tweetedBy": "1781088676375625728",
                "replyToUserId": ""
            }
        }
    ],
    "message": ""
}

    Tools

🖥️Node Providers

We are just an RPC away
Gelato

Gelato provides enterprise-grade RPC infrastructure to streamline development on its rollups. With elastic, auto-scalable nodes and built-in failover across servers, data centers, and networks, it ensures high availability and performance. Developers get a unified dashboard to track compute usage, throughput, and request volume, all while using a single RPC key to access multiple networks.

Key features:

    Auto-scalable nodes that adapt to demand

    Failover support for uninterrupted service

    Unified dashboard for monitoring performance

    Single RPC key for multi-network access

    Enables fast transactions, contract deployments, and blockchain queries without managing infrastructure

    Tools

🚰Faucets

Fuel your dev wallets

You can access testnet tokens via our faucet, linked below. We’ve included a CAPTCHA to prevent spam requests.

https://faucet.campnetwork.xyz/

    ools

🎲Randomness

Introducing randomness in your smart contracts
Gelato

In cryptography and decentralized applications, randomness is essential but difficult to achieve transparently on the blockchain. Gelato VRF (Verifiable Random Function) addresses this challenge.

Check out how to use Gelato's VRF here.

    Tools

🔮Oracles

Bridging offchain to onchain
STORK

Stork is a pull oracle designed for ultra low latency connections, facilitating communication between data providers and both on-chain and off-chain applications. It fetches off-chain price data, aggregates, verifies, and audits data from trusted publishers, making the aggregated data accessible with sub

    Testnet deploment address

https://docs.stork.network/resources/contract-addresses/evm#camp

    Tools

🔖Data Indexer

Get data faster
Goldsky

Goldsky is the go-to data indexer for web3 builders, offering high-performance subgraph hosting and realtime data replication pipelines. Goldsky offers two core self-serve products that can be used independently or in conjunction to power your data stack: Subgraphs and Mirror. docs

    Tools

🚊Interoperability

What to use when bridging assets over
Hyperlane

Hyperlane is a decentralized interoperability protocol that facilitates cross-chain communication and asset transfers between diverse blockchain networks, operating without centralized intermediaries or permission requirements.

Hyperlane is live on BaseCAMP at:
description
address

domainRoutingIsmFactory

0xDF32120eA83a7B91547c2e3Aaa5fa641b5f97958

interchainAccountIsm

0xcDA93E2CF91f1c3857f86078A794905edD9FCA73

interchainAccountRouter

0x57364C9bB48e391Ce578C720CD8B833445467de0

mailbox

0xF53f7866775f6F0ACB81181D262a7E9559E9584E

merkleTreeHook

0x1B4396f70Ec6Ae0DB573433447B7Ca3E17fcC5dA

proxyAdmin

0xE2C01D7Ecbc05A7897F93A07F3f36ED6ab6141f4

staticAggregationHookFactory

0x2226c9Eff57b3dc49cc9D8015030c8E43bB6cF67

staticAggregationIsmFactory

0x86Cfa9B8eC2D4be42324dc4Adcb40DCf533B45e4

staticMerkleRootMultisigIsmFactory

0xE9fAD8588C7ABBf4a9c585390EBE0F59702E6986

staticMerkleRootWeightedMultisigIsmFactory

0xD59362a054A438aDC1D9782b0A52Ee6Fe42371a8

staticMessageIdMultisigIsmFactory

0x93ab5AA8D0A883ea82f67b9993CE902d873b0E0D

staticMessageIdWeightedMultisigIsmFactory

0xdd8c2663924C88aDEDdB5De9950a205c045161b3

testRecipient

0x4578145c7C3a59be37B86e0b94e08b3a15B33fe6

validatorAnnounce

0x7a1b162c047F1F70Baeb073F4ee767EDAD3AAe05

Hyperlane token bridging is managed by the warp routes where each warp route is unique to the token and has the flexibility to add different security assumptions.
Short Guide to Initializing Warp Routes to Camp

    Install the Hyperlane cli

    Use the warp command to pull down the step menu and choose chains and work with the menu for deployment

hyperlane warp init

OR

Write up a warp route yaml in the format:

origin: basecamp
destination: sepolia
token: ETH
tokenConfig:
  type: native
  decimals: 18
  name: Ether
  symbol: ETH 

With the deployment command:

hyperlane warp deploy --config deployments/warp_routes/{warp-route-config.yaml}

    Tools
    ⚙️Misc Tooling

🍨Gelato

Gelato is a limitless Ethereum Rollup-as-a-Service (RaaS) platform offering fast, secure, and scalable rollups for deploying fully serviced chains integrated with web3 tools from the Genesis block. Leveraging zero-knowledge and optimistic Rollup technologies with optional alternative data availability layers, Gelato provides enhanced scalability and reduced transaction costs.

Central to our BaseCAMP is the Gelato Middleware, a robust suite of tools designed to automate and optimize your applications:

    Functions - smart contract automation

    Relay - gasless transaction

    VRF - verifiable onchain randomness

Fully-Integrated Partner Services

Our BaseCAMP offer a fully integrated web3 service suite, providing all the infrastructure and tools necessary to build feature-rich applications:

    Goldsky - read, edit, and sync fresh chain data

    dRPC - access reliable & globally distributed nodes

    Blockscout - access essential on-chain data

    Thirdweb - onboard anyone with flexible sign-in options

    ZeroDev - create smart wallets for your users

    Safe - use the most secure smart wallet infrastructure

    DIA - source data from on and off-chain platforms

    Tenderly - build, test, monitor, and operate smart contracts

    Tools
    ⚙️Misc Tooling

🧠ThirdWeb

Let's go over what we can do with ThirdWeb

Thirdweb is a comprehensive web3 development framework that offers all the tools needed to connect your apps and games to decentralized networks. With Mode now integrated into Thirdweb, you can leverage these powerful features to swiftly deploy and interact with your smart contracts. Visit their docs here.

Connect

Connect is a comprehensive toolkit designed to link every user to your application. It includes customizable onboarding flows, self-custodial in-app wallets, account abstraction, onramps, and additional features.

With Connect, you can:

    Connect to over 170 wallet providers with support for every EVM network.

    Log in and authenticate users with customizable, secure email, phone, and social login flows.

    Enable gasless options to smoothly onboard non-native or new crypto users with Account Abstraction.

    Perform wallet actions like connecting/disconnecting wallets, viewing balances, displaying ENS names, and more using our performant, reliable, and type-safe API.

    Easily integrate with thirdweb's Contract SDKs to enable user interaction with your application.

    Onramp user funds with a credit card using Pay.

Contracts

End-to-end tools for smart contract development.

Trusted, modular smart contracts that can be deployed securely on any EVM chain.

You can:

    Explore: Ready to deploy contracts

    Build: Write your own smart contracts

    Deploy: Contract deployment built for any use-case

    Publish: Publish your contracts onchain

    Interact: Integrate smart contract interactions directly into your app

Engine

Engine is an open-source, backend server that reads, writes, and deploys contracts at production scale.

Engine enables your app to:

    Send multiple blockchain transactions at once.

    Resubmit stuck transactions, handling nonce values, gas settings, and RPC errors.

    Avoid duplicate transactions.

    Manage multiple backend wallets and their funds.

    Control access from your backends and team members.

    Sponsor user gas fees.

    Deploy and interact with smart accounts.

    Subscribe to contract events and transactions.

SDK

Performant & lightweight SDK to interact with any EVM chain from Node, React and React Native.

    React and React Native UI Components: for wallets connection, transactions and more

    In-app wallets: first-class support for email and social logins

    Account abstraction: first-class support for ERC4337 smart accounts

    Type safe contract API: fully typed with human readable ABI

    Code generation: CLI to generate highly optimized contract, type-safe interfaces\

    RPC for any EVM chain: highly performant RPCs with just a chain id

    IPFS upload/download: simple and efficient IPFS integration

    Auto ABI resolution: resolve ABIs for any deployed contract with just an address

    Ethers / Viem Interoperability: adapters for ethers and viem libraries

    Tools
    ⚙️Misc Tooling
    ReOwn

Web3Modal SDK

The Web3Modal SDK is a flexible library that simplifies connecting Web3 apps with wallets, offering an intuitive interface for signing transactions and interacting with smart contracts.

The Web3Modal SDK supports ethers v5 and Wagmi, two Ethereum libraries that offer distinct developer experiences for interacting with the Camp Network.

    Tools

Important Contract Address

wCAMP (Wrapped ERC20 support Camp token) -> 0x1aE9c40eCd2DD6ad5858E5430A556d7aff28A44b

    Tutorials
    🚧Deploying a Smart Contract

🏫Deploying Smart Contracts with Remix

This tutorial will show you how to deploy smart contracts on the BaseCAMP using Remix. You'll learn to set up your environment, write, compile, and deploy your contracts seamlessly.

    Tutorials
    🚧Deploying a Smart Contract

🧠Deploying Smart Contracts with ThirdWeb

ThirdWeb tutorial with Camp Network

Thirdweb is a comprehensive web3 development framework that offers all the tools needed to connect your apps and games to decentralized networks. With Camp Network now integrated into Thirdweb, you can swiftly deploy and interact with your smart contracts using these powerful features.
1. Download ThirdWeb CLI 

In this we will install it globally. Refer to the docs right here.

npm i -g thirdweb

2. Create the Local Environment

npx thirdweb create

With the following configurations:
3. Obtain your ThirdWeb API key

Thirdweb services require an API key, so let’s create one. There is an official tutorial here but let’s go through it quickly. To get an API key, go to https://thirdweb.com/dashboard/settings/api-keys. Connect your wallet and you will be prompted with a message to sign from Metamask (you can use other wallets if you prefer). Once your wallet is connected, you should be able to switch to Mode network and also Create an API Key.
4. Deploy your smart contract
5. Go to your Smart Contract Dashboard

To track all your smart contracts and easily interact with them, Thirdweb provides us with a contracts dashboard. Just go to https://thirdweb.com/dashboard/contracts and you will see all your deployed contracts.

Congratulations! You have deployed your smart contract with ThirdWeb!

    Tutorials

✔️Verifying Your Smart Contracts

In here we demonstrate on how you can verify smart contracts in blockscout

Verifying a smart contract involves confirming that the code deployed on the blockchain matches the source code provided by the developer. This verification process ensures transparency and trust, as it allows all users to see the source code in clear text. By making the source code publicly accessible, users can independently verify the contract’s functionality and security, fostering greater confidence in the decentralized application’s integrity.
Using Forge Foundry

forge verify-contract <contract address> src/SomeContract.sol:SomeContract --verifier blockscout --verifier-url https://basecamp.cloud.blockscout.com/api

Using Remix

Using the verify tab fill details similar to the one below

After verifying you should see that your smart contract has the green checkmark

