const Token = artifacts.require('token')
const Exchange = artifacts.require('Exchange')

module.exports = async function(deployer) {
  const accounts = await web3.eth.getAccounts()	
  await deployer.deploy(Token)

  const feeAccount = accounts[0]
  const feePersent = 10
  await deployer.deploy(Exchange, feeAccount, feePersent)

};
 