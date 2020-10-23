const Token = artifacts.require('Token')
const Exchange = artifacts.require('Exchange')

//helper start
const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
const ether = (n) => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(),'ether')
	)
}

const tokens = (n) => ether(n)
const wait = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}
//helper end



module.exports = async function(callback){
	try{

		const accounts = await web3.eth.getAccounts()
		const token = await Token.deployed()
		console.log('Token fatched ', token.address)

		const exchange = await Exchange.deployed()
		console.log('Exchange fatched ', exchange.address)

		let sender, receiver, amount
		sender = accounts[0]
		receiver = accounts[1]
		amount = tokens(100)

		await token.transfer(receiver, amount, { from:sender })
		console.log(`Transferred ${amount} tokens from ${sender} to ${receiver}`)

		const user1 = accounts[0]
		const user2 = accounts[1]
		amount = ether(1)

		await exchange.depositEther( { from:user1, value:amount })
		console.log(`Deposit ${amount} Ether from ${user1} `)
		amount = tokens(100)
		await token.approve( exchange.address, amount, { from:user2 })
		console.log(`Approve ${amount} tokens from ${user2}`)
		await exchange.depositToken(token.address, amount, { from:user2 })
		console.log(`Deposit ${amount} tokens from ${user2}`)


		/*

				Cancelled order
				

		*/

		let result
		let orderId

		result = await exchange.makeOrder(token.address, tokens(10), ETHER_ADDRESS, ether(0.1), { from:user1 })
		console.log(`Make order from ${user1}`)
		orderId = result.logs[0].args.id

		await exchange.cancelOrder(orderId)
		console.log(`Cancelled order by ${user1}`)

		/*

			Filled Order
		*/
		await wait(1)
		

		result = await exchange.makeOrder(token.address, tokens(5), ETHER_ADDRESS, ether(0.1), { from:user1 })
		console.log(`Make order from ${user1}`)
		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, { from:user2 })
		console.log(`Filled order by ${user2}`)
		await wait(1)



		result = await exchange.makeOrder(token.address, tokens(15), ETHER_ADDRESS, ether(0.2), { from:user1 })
		console.log(`Make order from ${user1}`)
		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, { from:user2 })
		console.log(`Filled order by ${user2}`)
		await wait(1)


		result = await exchange.makeOrder(token.address, tokens(25), ETHER_ADDRESS, ether(0.3), { from:user1 })
		console.log(`Make order from ${user1}`)
		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, { from:user2 })
		console.log(`Filled order by ${user2}`)
		await wait(1)

		let _amount1 = 5
		// 下二十个单子
		for (let i=0;i<10;i++) {
			if(i>6) _amount1++
			result = await exchange.makeOrder(token.address, tokens(_amount1), ETHER_ADDRESS, ether(0.04), { from:user1 })
			console.log(`Make order from ${user1}`)
			await wait(1)	
		}

		let _amount2 = 5
		for (let i=0;i<10;i++) {
			if(i>4) _amount2++
			result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.04), token.address, tokens(_amount2), { from:user2 })
			console.log(`Make order from ${user2}`) 
			await wait(1)	
		}


	}catch(error){
		console.log(error)
	}

	callback()
}