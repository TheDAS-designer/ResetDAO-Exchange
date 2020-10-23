import { tokens, ether, EVM_REVERT, ETHER_ADDRESS} from './helper'

const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange',([deployer,feeAccount,user1,user2]) => {
	let token
	let exchange
	let amount
	const feePersent = 10

	beforeEach(async () => {
		amount = tokens(100)
		token = await Token.new()
		token.transfer(user1, amount, { from: deployer})
		exchange = await Exchange.new(feeAccount, feePersent)
	})

	describe('deployment', () => {
		
		it('tracks the feeAccount', async () => {
			const result = await exchange.feeAccount()
			result.toString().should.equal(feeAccount.toString())
		})

		it('tracks the feePersent', async () => {
			const result = await exchange.feePersent()
			result.toString().should.equal(feePersent.toString())
		})
		
	})

	describe('fallback', () => {
		it('reverts when ether is sent', async () => {
			await exchange.sendTransaction({ value:ether(1), from: user1 })
				.should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('depositing ether', () => {
		let amount
		let result

		beforeEach(async () => {
			amount = ether(1)
			result = await exchange.depositEther({ from: user1, value:amount })
		})

		it('tracks the ether deposit', async () => {
			const balance = await exchange.tokens(ETHER_ADDRESS, user1)
			balance.toString().should.equal(amount.toString())
		})

		it('emit the Deposit event', async () => {
			const log = result.logs[0]
			log.event.should.eq('Deposit')

			const event = log.args
			event.token.should.eq(ETHER_ADDRESS, 'token is correct')
			event.user.should.eq(user1, 'user is correct')
			event.value.toString().should.eq(amount.toString(), 'value is correct')
			event.balance.toString().should.eq(amount.toString(), 'balance is correct')
		})
	})

	describe('withdraw Ether',() => {
			let amount
			let result
		describe('success',() => {

			beforeEach(async () => {
				amount = tokens(1)
				await exchange.depositEther({ from:user1, value:tokens(2)})
				result = await exchange.withdrawEther({ from:user1, value:amount })
			})

			it('withdraw ether funds', async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS, user1)
				balance.toString().should.eq(amount.toString())
			})

			it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Withdraw')
				const event = log.args
				event.token.should.eq(ETHER_ADDRESS, 'token is correct')
				event.user.should.eq(user1, 'user is correct')
				event.value.toString().should.eq(amount.toString(), 'value is correct')
				event.balance.toString().should.eq(amount.toString(), 'balance is correct')
			})
		})

		describe('failure',() => {

			beforeEach(async () => {
				amount = tokens(2)
				await exchange.depositEther({ from:user1, value:tokens(1)})
				
			})

			it('rejects withdraws insufficient balance', async () => {
				result = await exchange.withdrawEther({ from:user1, value:amount })
					.should.be.rejectedWith(EVM_REVERT)
			})
		})
	})

	describe('depositing tokens', () => {
		let result

		describe('success', () => {
			
			beforeEach( async () => {
				amount = tokens(10)
				await token.approve(exchange.address, amount, { from: user1})
				result = await exchange.depositToken(token.address, amount, { from: user1})
			})
			
			it('tracks the token deposit', async () => {
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.eq(amount.toString())
				balance = await exchange.tokens(token.address, user1)
				balance.toString().should.eq(amount.toString())
			})

			it('emit an Deposit event',async () => {
				const log = result.logs[0]
				log.event.should.eq('Deposit')

				const event = log.args
				event.token.should.eq(token.address, 'token is correct')
				event.user.should.eq(user1, 'user is correct')
				event.value.toString().should.eq(amount.toString(), 'value is correct')
				event.balance.toString().should.eq(amount.toString(), 'balance is correct')
				//console.log(event)
			})
		})

		describe('failure', () => {

			it('rejects Ether deposits', async () => {
				await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 })
					.should.be.rejectedWith(EVM_REVERT)
			})
			
			it('fails when no tokens are approved', async () => {
				await exchange.depositToken(token.address, tokens(10), { from: user1 })
					.should.be.rejectedWith(EVM_REVERT)
			})
		})
		
	})


	describe('withdraw Token',() => {
			let amount
			let result
		describe('success',() => {

			beforeEach(async () => {
				amount = tokens(10)
				
				await token.approve(exchange.address, tokens(20), { from:user1 })
			
				await exchange.depositToken(token.address, tokens(20), { from:user1 })
				result = await exchange.withdrawToken(token.address, amount, { from:user1 })
			})

			it('withdraw token funds', async () => {
				const balance = await exchange.tokens(token.address, user1)
				balance.toString().should.eq(amount.toString())
			})

			it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Withdraw')
				const event = log.args
				event.token.should.eq(token.address, 'token is correct')
				event.user.should.eq(user1, 'user is correct')
				event.value.toString().should.eq(amount.toString(), 'value is correct')
				event.balance.toString().should.eq(amount.toString(), 'balance is correct')
			})
		})

		describe('failure',() => {

			beforeEach(async () => {
				amount = tokens(20)
				await token.approve(exchange.address, tokens(10), { from:user1 })
				await exchange.depositToken(token.address, tokens(10), { from:user1})
				
			})

			it('rejects withdraws insufficient balance', async () => {
				await exchange.withdrawToken(token.address, amount, { from:user1 })
					.should.be.rejectedWith(EVM_REVERT)
			})
		})
	})

	describe('checking balances', () => {
		let amount
		beforeEach(async () => {
			amount = tokens(10)
			await token.approve(exchange.address, amount , {from:user1})
			await exchange.depositToken(token.address, amount, {from:user1})
		})

		it('returns user balance', async () => {
			const balance = await exchange.balanceOf(token.address, user1)
			balance.toString().should.equal(amount.toString())
		})
	})

	describe('making orders', () => {

		let tokenGet
		let amountGet
		let tokenGive
		let amountGive
		let result


		beforeEach( async () => {
			tokenGet = token.address
			amountGet = tokens(100)
			tokenGive = ETHER_ADDRESS
			amountGive = tokens(1)
			
			result = await exchange.makeOrder(tokenGet, amountGet, tokenGive, amountGive, { from:user1 })
		})

		it('tracks the newly created order', async () => {
			
			const order = await exchange.orders(1)
			
			order.tokenGet.toString().should.equal(tokenGet.toString())
			order.amountGet.toString().should.equal(amountGet.toString())
			order.tokenGive.toString().should.eq(tokenGive.toString())
			order.amountGive.toString().should.eq(amountGive.toString())
			order.user.toString().should.eq(user1.toString())

		})

		it('emits an "Order" event', async () => {
			const log = result.logs[0]
			log.event.should.eq('Order')

			const event = log.args
			event.tokenGet.toString().should.equal(tokenGet.toString())
			event.amountGet.toString().should.equal(amountGet.toString())
			event.tokenGive.toString().should.eq(tokenGive.toString())
			event.amountGive.toString().should.eq(amountGive.toString())
			event.user.toString().should.eq(user1.toString())
		})
	})	

		describe('order actions', () => {


			describe('cancelling orders', () => {
				
				describe('success',  () => {
					let result
					beforeEach(async() => {
						result = await exchange.cancelOrder('1', { from:user1 })
					})

					it('updates cancelled orders', async() => {
						const cancelOrder = await exchange.cancelOrders(1)
						cancelOrder.should.eq(true)
					})

					it('emit a "CancelOrder" event', async () => {
						const log = result.logs[0]
						log.event.should.eq('CancelOrder')

						const event = log.args
						event.tokenGet.toString().should.equal(tokenGet.toString())
						event.amountGet.toString().should.equal(amountGet.toString())
						event.tokenGive.toString().should.eq(tokenGive.toString())
						event.amountGive.toString().should.eq(amountGive.toString())
						event.user.toString().should.eq(user1.toString())
					})
				})

				describe('failure', async () => {
					it('rejects invalid order ids', async () => {
						const invalidOrderId = 99999
						const result = await exchange.cancelOrder(invalidOrderId, { from:user1 })
							.should.be.rejected
					})

					it('rejects unauthorized cancelations', async () => {
						await exchange.cancelOrder('1', { from:user2 })
							.should.be.rejected
					})
				})
			})

			describe('filling orders', () => {
				let amount 
				let tokenGet
				let amountGet
				let tokenGive
				let amountGive
				beforeEach( async () => {
					tokenGet = token.address
					amountGet = tokens(100)
					tokenGive = ETHER_ADDRESS
					amountGive = ether(1)
					
					
					amount = tokens(200)
					await token.transfer(user2, amount)
					await token.approve(exchange.address, amount, { from:user2 })
					await exchange.depositToken(token.address, amount, { from:user2 })
					await exchange.depositEther({ from:user1 , value:ether(5) })
					await exchange.makeOrder(tokenGet, amountGet, tokenGive, amountGive, { from:user1 })
				})

				describe('success', () => {
					let result
					let feeAmount
					beforeEach( async () => {
						feeAmount = (100*feePersent)/100
						result = await exchange.fillOrder(1, { from: user2 })
						

					})

					it('executes the trade and the charge fee', async () => {
						let balance
						balance = await exchange.balanceOf(token.address, user1)
						balance.toString().should.eq(tokens(100).toString())
						balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
						balance.toString().should.eq(tokens(4).toString())

						balance = await exchange.balanceOf(token.address, user2)
						balance.toString().should.eq(tokens(200 - 100 - feeAmount).toString())
						balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
						balance.toString().should.eq(tokens(1).toString())

						balance = await exchange.balanceOf(token.address, feeAccount)
						balance.toString().should.eq(tokens(feeAmount).toString())
					})

					it('emits a Trade event', async () => {
					 	const log = result.logs[0]
					 	log.event.toString().should.eq('Trade')

					 	const event =  log.args
					 	event.id.toString().should.eq('1')

					 	event.user.toString().should.eq(user1.toString())

					 	event.userFill.toString().should.eq(user2.toString())

					 	event.tokenGet.toString().should.eq(tokenGet.toString())

					 	event.amountGet.toString().should.eq(amountGet.toString())

					 	event.tokenGive.toString().should.eq(tokenGive.toString())

					 	event.amountGive.toString().should.eq(amountGive.toString())

					 	event.feeAmount.toString().should.eq(tokens(feeAmount).toString())
					})	
				})
			})
			
		})
	


})