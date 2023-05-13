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

        const web3 = new web3(provider);
        const networkId = await web3.eth.net.getId();
        const networkData = Ticket.networks[networkId];
        if (networkData) {
          const ticketContract = new web3.eth.Contract(Ticket.abi, networkData.address);
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
    if (contract && account) {
      const dateInUnixTimestamp = Math.floor(new Date(date).getTime() / 1000);
      await contract.methods
        .mintTicket(title, venue, dateInUnixTimestamp, price, imageURI)
        .send({ from: account });
    }
  };

  const handleBuyTicket = async () => {
    if (contract && account) {
      const ticket = await contract.methods.tickets(tokenId).call();
      await contract.methods
        .buyTicket(tokenId)
        .send({ from: account, value: web3.utils.toWei(ticket.price, "ether") });
    }
  };

  const handleTransferTicket = async (recipient) => {
    if (contract && account) {
      await contract.methods
        .transferFrom(account, recipient, tokenId)
        .send({ from: account });
    }
  };

  const fetchTickets = async () => {
    if (contract) {
      const totalSupply = await contract.methods.totalSupply().call();
      let ticketsArray = [];
      for (let i = 1; i <= totalSupply; i++) {
        let ticket = await contract.methods.tickets(i).call();
        ticketsArray.push(ticket);
      }
      setTickets(ticketsArray);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [contract]);

  return (
    <div>
      <button onClick={connectMetaMask}>Connect MetaMask</button>

      {/* Seller side */}
      <h2>Mint a Ticket</h2>
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Venue" onChange={(e) => setVenue(e.target.value)} />
      <input type="date" placeholder="Date" onChange={(e) => setDate(e.target.value)} />
          <input type="number" placeholder="Price (in ETH)" onChange={(e) => setPrice(e.target.value)} />
                <input type="text" placeholder="Image URI" onChange={(e) => setImageURI(e.target.value)} />
                <button onClick={handleMintTicket}>Mint Ticket</button>

                {/* Buyer side */}
                <h2>Buy a Ticket</h2>
                <input type="number" placeholder="Token ID" onChange={(e) => setTokenId(e.target.value)} />
                <button onClick={handleBuyTicket}>Buy Ticket</button>

                {/* Transfer side */}
                <h2>Transfer a Ticket</h2>
                <input type="number" placeholder="Token ID" onChange={(e) => setTokenId(e.target.value)} />
                <input type="text" placeholder="Recipient Address" onChange={(e) => setRecipient(e.target.value)} />
                <button onClick={() => handleTransferTicket(recipient)}>Transfer Ticket</button>

                {/* Display all minted tickets */}
                <h2>All Tickets</h2>
                <ul>
                  {tickets.map((ticket, index) => (
                    <li key={index}>
                      <img src={ticket.imageURI} alt="ticket" width="100" />
                      <h3>{ticket.title}</h3>
                      <p>Venue: {ticket.venue}</p>
                      <p>Date: {new Date(ticket.date * 1000).toLocaleString()}</p>
                      <p>Price: {web3.utils.fromWei(ticket.price, "ether")} ETH</p>
                      <p>Token ID: {index + 1}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          };

          export default TicketApp;
