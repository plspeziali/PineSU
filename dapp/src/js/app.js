App = {
  web3Provider: null,
  contracts: {},

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('SURegistry.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      App.contracts.SURegistry = TruffleContract(data);
    
      // Set the provider for our contract
      App.contracts.SURegistry.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      // return App.markAdopted();
      return App.init();

    });

    // return App.bindEvents();
      return App.AddSUButton();

  },

  init: async function() {
    // Load Products.
    var postInstance;
    var modalbody = $('#modal-body');

    /*const fs = require('fs');

    var data = fs.readFileSync("latest_hashes.json");*/

    $.getJSON('./src/latest_hashes.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      $('#prova').append(data);
      var myObj = JSON.parse(data);
      modalbody.getElementById('listSU').append("<ul>");
      for(el of myObj){
        modalbody.getElementById('listSU').append(el.name+": "+el.hash);
      }
      modalbody.getElementById('listSU').append("</ul>");

    });
    
    App.contracts.SURegistry.deployed().then(function(instance){
      postInstance = instance;
      return postInstance.SUCount();
    }).then(function(result){

      var counts = result.c[0];
      console.log("Total Hashes : "+counts);

      for (var i = 1; i <= counts; i ++) {
        postInstance.registry(i).then(function(result)
        {
          console.log("Hash:" +result[0]);

          var newsRow = $('#SURow');
          var postTemplate = $('#postTemplate');

          postTemplate.find('.panel-title').text(result[0]);
          newsRow.append(postTemplate.html());
         });
      }
    });
},

  AddSUButton: function() {
    $(document).on('click', '.addSU', App.AddSU);
  },

  
  AddSU:function(event){
    var post = document.getElementById('post').value
    var postInstance;
    App.contracts.news.deployed().then(function(instance){
      postInstance = instance;
      return postInstance.addSUs(post);
    }); 
    console.log("Storage Unit(s) registered");
  },
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});