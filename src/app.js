'use strict';

import Web3 from "web3";

document.querySelector('#root').innerHTML = `
  <div>
    <h1>Add New Product </h1>
    <div>
      <input type="text" id="name" placeholder="Book"/>
      <br/>
      <input type="number" id="price" placeholder="$20.00"/>
      <br/>
      <input type="text" id="description" placeholder="A book"/>
      <br/>
      <input type="text" id="color" placeholder="gray"/>
    </div>
    <div>
      <button id="submit">Add Product</button>
    </div>
    <div id="productos" style="display: flex; justify-content: space-around; flex-wrap: wrap;"></div>

  <div>
`;




const App = {

  network_id: 5777, 
  contract_path: 'src/MyContract.json',
  contract_address: "0x760f5C046007B376578023FC7aB44e48a28aA645",

  init: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
  },

  loadWeb3: async () => {

    if(window.ethereum) {
      web3 = new Web3(window.web3.currentProvider)
      await window.ethereum.request({ method: "eth_requestAccounts" })
    } else {
      alert('Please Instal Metamask')
    }

  },

  loadAccount: async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    App.account = accounts[0];
  },

  loadContract: async () => {
    const netId = await web3.eth.net.getId()


    if(App.network_id === netId) {
      const contract = await App.getContract(web3, App.contract_path, App.contract_address);
      console.log(contract);
      await App.addProduct(contract);
      await App.renderProductos(contract)

    } else {
      alert('Please set the network GANACHE')
    }
  },

  getContract: async (web3, contract_path, contract_address) => {
    const request = await fetch(contract_path);
    const data = await request.json();

    const contract = new web3.eth.Contract(data, contract_address)
    return contract;
  }, 

  addProduct: async (contract) => {
    const submit = document.querySelector('#submit');
    submit.addEventListener('click' , async (e) => {
      e.preventDefault();
      if(e) { 
        const name = document.querySelector('#name').value;
        const price = document.querySelector('#price').value;
        const description = document.querySelector('#description').value;
        const color = document.querySelector('#color').value;

        if(name !== "" && price !== "" && description !== "" &&  color !== "") {
          console.log(name, price, description, color)
          await contract.methods.setProduct(name, price, description, color)
          .send({ from: App.account, gas: 0 })
          .on('transactionHash', function (hash) {
            console.log('Approving', hash)
            // document.getElementById("web3_message").textContent = "Approving...";
          })
          .on('receipt', function (receipt) {
            console.log('Success', receipt)
            window.location.reload();
            // document.getElementById("web3_message").textContent = "Success!";
          })
          .catch((revertReason) => {
            console.log('ERROR ',revertReason)
            // console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
          });
        } else{
          alert('All data must be completed.');
        }
      }
    })
  },

  renderProductos: async (contract) => {

    const usersCounter = await contract.methods.producConter().call();

    let html = ``

    for (let i = 1; i <= usersCounter; i++) {

      const result = await contract.methods.getProduct(i).call();

      console.log(result)

      let card = `
        <div style="box-shadow: 1px 1px 5px #7a7a7a; border-radius: 5px; width: max-content; padding: 20px; text-align: center;"> 
          <div>
            <h2> ${result.name}<h2>
          </div>
          <div>
            <p> ${result.price}<p>
          </div>
          <div>
           <p> ${result.descriptiom}<p>
          </div>
          <div>
            <p> ${result.color}<p>
         </div>
        </div>
      `
      html += card;

    }

    document.querySelector("#productos").innerHTML = html;

  }



}

App.init();