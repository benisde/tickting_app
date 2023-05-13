import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import web3 from "web3";
import Ticket from "./build/contracts/Ticket.json";

const TicketApp = () => {
  // State variables
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    connectMetaMask();
  }, []);

  const connectMetaMask = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      try {
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const web3Instance = new web3(provider);
        const networkId = await web3Instance.eth.net.getId();
        const networkData = Ticket.networks[networkId];
        if (networkData) {
          const ticketContract = new web3Instance.eth.Contract(Ticket.abi, networkData.address);
          setContract(ticketContract);
        } else {
          alert("Smart contract not deployed to the detected network.");
        }
      } catch (error) {
        console.error("User rejected connection");
      }
    } else {
      alert("Please install MetaMask.");
    }
  };

  const handleMintTicket = async () => {
    if (contract && account && title && venue && date && price && imageURI) {
      if (!isNaN(date) && !isNaN(price)) {
        await contract.methods
          .mintTicket(title, venue, date, price, imageURI)
          .send({ from: account });
      } else {
        alert("Date and price need to be valid numbers.");
      }
    }
  };

  const handleBuyTicket = async () => {
    if (contract && account && tokenId) {
      if (!isNaN(tokenId)) {
        const ticket = await contract.methods.tickets(tokenId).call();
        await contract.methods
          .buyTicket(tokenId)
          .send({ from: account, value: ticket.price });
      } else {
        alert("Token ID needs to be a valid number.");
      }
    }
  };

  const handleTransferTicket = async (recipient) => {
    if (contract && account && tokenId && recipient) {
      if (!isNaN(tokenId)) {
        await contract.methods
          .transferFrom(account, recipient, tokenId)
          .send({ from: account });
      } else {
        alert("Token ID needs to be a valid number.");
      }
    }
  };

  return (
    <div>
      <button onClick={connectMetaMask}>Connect MetaMask</button>
      
      {/* UI components for minting tickets */}
      <h2>Mint a Ticket</h2>
      <input
        type="text"
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Venue"
        onChange={(e) => setVenue(e.target.value)}
      />
      <input
        type="number"
        placeholder="Date (UNIX timestamp)"
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="number"
          placeholder="Price (in wei)"
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URI"
          onChange={(e) => setImageURI(e.target.value)}
        />
        <button onClick={handleMintTicket}>Mint Ticket</button>

        {/* UI components for buying tickets */}
        <h2>Buy a Ticket</h2>
        <input
          type="number"
          placeholder="Token ID"
          onChange={(e) => setTokenId(e.target.value)}
        />
        <button onClick={handleBuyTicket}>Buy Ticket</button>

        {/* UI components for transferring tickets */}
        <h2>Transfer a Ticket</h2>
        <input
          type="number"
          placeholder="Token ID"
          onChange={(e) => setTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Recipient Address"
          onChange={(e) => setRecipient(e.target.value)}
        />
        <button onClick={() => handleTransferTicket(recipient)}>Transfer Ticket</button>

        {/* UI components for displaying ticket details */}
        <h2>My Tickets</h2>
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.tokenId}>
              <img src={ticket.imageURI} alt="ticket" width="100" />
              <h3>{ticket.title}</h3>
              <p>Venue: {ticket.venue}</p>
              <p>Date: {new Date(ticket.date * 1000).toLocaleString()}</p>
              <p>Price: {web3.utils.fromWei(ticket.price, "ether")} ETH</p>
            </li>
          ))}
        </ul>
          {/* UI components for displaying ticket details */}
          <h2>All Tickets</h2>
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.tokenId}>
                <img src={ticket.imageURI} alt="ticket" width="100" />
                <h3>{ticket.title}</h3>
                <p>Token ID: {ticket.tokenId}</p>
                <p>Venue: {ticket.venue}</p>
                <p>Date: {new Date(ticket.date * 1000).toLocaleString()}</p>
                <p>Price: {web3.utils.fromWei(ticket.price, "ether")} ETH</p>
              </li>
            ))}
          </ul>
      </div>
    );
  };

  export default TicketApp;

