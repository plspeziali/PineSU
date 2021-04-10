App = {
  web3Provider: null,
  contracts: {},
  hashValue: "",
  registeredHashes: [],

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

    /*const fs = require('fs');

    var data = fs.readFileSync("latest_hashes.json");*/

    $.getJSON('./latest_hashes.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      console.log(data);
      for(el of data.slice(0,data.length-1)){
        $('#listSU').append("<li>"+el.name+": "+el.hash+"</li>");
      }
      App.hashValue = data[data.length-1].hash;
      $('#defineSU').append("The selected SU will be registered opn the blockchain network as the hash: "+App.hashValue);
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
          console.log("Hash: " +result);

          var newsRow = $('#SURow');
          var postTemplate = $('#postTemplate');

          postTemplate.find('.panel-title').text(result);
          App.registeredHashes.push(result);
          newsRow.append(postTemplate.html());
         });
      }
    });
},

  AddSUButton: function() {
    $(document).on('click', '.addSU', App.AddSU);
  },

  
  AddSU:function(event){
    var post = App.hashValue;
    if(!App.registeredHashes.includes(post)){
      var postInstance;
      App.contracts.SURegistry.deployed().then(function(instance){
        postInstance = instance;
        return postInstance.addSU(post);
      }); 
      console.log("Storage Unit(s) registered");
    } else {
      $('.alertSU').append('<div class="alert alert-danger alert-dismissible fade in">'+
      +'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
      +'<strong>Error!</strong> This Storage Unit(s) Hash has already been registered.</div>');
    }
  },
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});